"use strict";


//used to generate dummy data.
function createTaskLite(taskID, index, parentTask){
	dPush(`\t\tCreate Task Lite: ${taskID}`);
	const temp = tasks.find(x => x.id === taskID);
	if(!temp){return null;}
	dPush(`\t\t\t${temp.text}`);
	
	const newTask = new task(taskID, Number(index)+1, temp.text, null, temp.time, temp.audio, parentTask, true);
	
	return newTask;
}
function loadTasksLite(taskIDs, parentTask){
	dPush('\tLoad Tasks Lite: ' + parentTask.text);
	for(let index in taskIDs){
		const t = taskIDs[index];
		const newTask = createTaskLite(t.id, index, parentTask);
		if(t.tasks && t.tasks.length > 0){
			loadTasksLite(t.tasks, newTask);
		}
	}
}

function getDays(){
	const now = Date.now();
	const output = [];
	const scale = 1000 * 60 * 60 * 24 * 365;
	for(let i=0;i<25;i++){
		const delta = Math.random() * scale;
		output.push(new Date(now - delta));
	}
	return output.sort((a,b) => b-a);
}

function getLeafs(task, output){
	if(!task){return output;}
	if(task.children.length === 0){
		output.push(task);
	}
	else{
		for(let i=0;i<task.children.length;i++){
			getLeafs(task.children[i], output);
		}
	}
	return output;
}

function generateLeafData(leafs, autoDone, autoTime){
	let time = 0;
	const reminderScew = Math.random() * 3;
	for(let i=0;i<leafs.length;i++){
		const leaf = leafs[i];
		time += (autoTime || autoDone)?50:(Math.random()*30000+5000);
		leaf.started = time;
		time += autoTime?leaf.time:((leaf.time/2)+Math.random()*leaf.time);
		leaf.completed = time;
		
		const reminders = Math.floor(Math.random() * (reminderScew) + reminderScew);
		leaf.reminders = reminders;
	}
}

function minDescendantStart(task){
	if(task.children.length === 0){return task.started;}
	
	let min = task.children[0].started;
	for(let i=1;i<task.children.length;i++){
		min = Math.min(min, minDescendantStart(task.children[i]));
	}
	return min;
}

function maxDescendantEnd(task){
	if(task.children.length === 0){return task.completed;}

	let max = task.children[0].completed;
	for(let i=1;i<task.children.length;i++){
		max = Math.max(max, maxDescendantEnd(task.children[i]));
	}
	return max;
}

function calculateTaskData(task){
	task.started = minDescendantStart(task);
	task.completed = maxDescendantEnd(task);
	task.reminders = task.descendantReminders();
	
	for(let i=0;i<task.children.length;i++){
		calculateTaskData(task.children[i]);
	}
}

function getTaskCompletedData(task, output=[]){
	output.push(task.completedRow());
	for(let i=0;i<task.children.length;i++){
		getTaskCompletedData(task.children[i], output);
	}
	return output;
}

function generateRoutineData(r){
	const days = getDays();
	
	const output = [];
	for(let i=0;i<days.length;i++){
		const data = generateInstanceData(r, days[i]);
		const completedData = getTaskCompletedData(data);
		output.push({epoch: `${days[i].getTime()}`, data: completedData});
	}
	return output;
}

function generateInstanceData(r, day){
	const autoDone = r.autoAdvanceDone || false;
	const autoTime = r.autoAdvanceTimer || false;
	const rootTask = new task(-1, "Routine", null, null, null, null);
	loadTasksLite(r.tasks, rootTask);
	const leafs = getLeafs(rootTask, []).sort((a,b) => {
		const at = a.btn.id || '';
		const bt = b.btn.id || '';
		return at.localeCompare(bt);
	});
	
	generateLeafData(leafs, autoDone, autoTime);
	calculateTaskData(rootTask);
	return rootTask;
}

function buildInstanceSave(epoch, data){
	const newData = [];
	newData.push(intToString(epoch));

	for(let i=0;i<data.length;i++){
		const c = data[i];
		newData.push(`${intToString(c.id)} ${c.taskNum} ${intToString(c.allocated/1000)} ${intToString(c.started)} ${intToString(c.completed)} ${intToString(c.reminders)}`);
	}
	
	return newData.join('│');
}

function buildRoutineSave(id, input){
	for(let i=0;i<input.length;i++){
		const saveData = buildInstanceSave(input[i].epoch, input[i].data);
		const loadData = loadSave(saveData);
		Storage.appendData(id, loadData, saveData);
	}
}

function generateDummyData(sender){
	sender.disabled = true;
	
	for(routine in availableRoutines){
		const r = availableRoutines[routine]
		if(r.id === -1){continue;}
		const data = generateRoutineData(r);
		Storage.appendData(r.id, data);
	}
	
	resetGraphOptions();
	sender.classList.add('hide');
	alert('Data generated');
}