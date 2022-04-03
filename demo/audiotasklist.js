"use strict";

let isAudioPlaying = false;
let availableRoutines = [];
let routineArea = null;
let settingsArea = null;
let completedArea = null;
let completedTable = null;
let routineName = null;
let taskArea = null;
let doneBtn = null;
let remindBtn = null;

let routineStarted = 0;
let routineCompleted = 0;

let currentRoutine = null;
let currentTask = null;
let previousTask = null;

let loopTimeout = null;
let timerInterval = null;
let startStopTimer = null;
let timerDisplay = null;
let currentTime = 0;

let loopAudio = false;
let loopDelay = 10;
let autoAdvanceChildren = false;
let enforceChildrenOrder = false;
let hideCompletedTasks = false;

let completedData = [];
let sortCol = 'taskNum';
let sortAsc = true;

function sortData(a, b){
	switch(typeof a[sortCol]){
		case "number": {
			return b[sortCol]-a[sortCol] * (sortAsc?1:-1);
		}
		default:{
			return a[sortCol].localeCompare(b[sortCol]) * (sortAsc?1:-1);
		}
		
	}
}
function sortCompletedData(){
	completedTable.replaceChildren();
	completedData = completedData.sort((a,b) => sortData(a, b));
	
	for(let i=0;i<completedData.length;i++){
		const rowData = completedData[i];
		const newRow = completedTable.insertRow();
		const numCell = newRow.insertCell();
		const nameCell = newRow.insertCell();
		const durationCell = newRow.insertCell();
		const remindersCell = newRow.insertCell();
		
		numCell.textContent = rowData.taskNum;
		nameCell.textContent = rowData.name;
		durationCell.textContent = rowData.duration;
		remindersCell.textContent = rowData.reminders;
	}
}
function addTableRow(rowData){
	let index = 0;
	while(index < completedData.length && sortData(completedData[index], rowData) === (sortAsc?-1:1))
	{
		index++;
	}
	
	completedData.splice(index, 0, rowData);
	const newRow = completedTable.insertRow(index);
	const numCell = newRow.insertCell();
	const nameCell = newRow.insertCell();
	const durationCell = newRow.insertCell();
	const remindersCell = newRow.insertCell();
	
	numCell.textContent = rowData.taskNum;
	nameCell.textContent = rowData.name;
	durationCell.textContent = rowData.duration;
	remindersCell.textContent = rowData.reminders;
}
function sort(col){
	if(col === sortCol){
		sortAsc = !sortAsc;
	}
	else{
		sortCol = col;
		sortAsc = true;
	}
	
	sortCompletedData();
}

function updateNotAllowedOnChkChange(task, next, add){
	if(task.completed){return;}
	
	if(next && (next === task || next.isDescendant(task))){
		task.btn.classList.remove('notAllowed');
	}
	else{
		task.btn.classList.toggle('notAllowed', add);
		task.btn.classList.remove('current');
		task.btn.classList.add('unstarted');
	}
	
	for(let index in task.children){
		updateNotAllowedOnChkChange(task.children[index], next, add);
	}
}

function themeChange(){
	
}
function loopChange(){
	loopAudio = document.getElementById("chkLoop").checked;
}
function loopDelayChange(){
	loopDelay = document.getElementById("numDelay").value * 1000;
}
function autoAdvanceChange(){
	autoAdvanceChildren = document.getElementById("chkAuto").checked;
	
	const next = getNextUncompletedTask();
	updateNotAllowedOnChkChange(root, next, autoAdvanceChildren);
	
	updateNotAllowed();
	root.collapseDescendants();
	next.expandWrapper();
	if(autoAdvanceChildren){
		autoAdvance();
	}
}
function enforceOrderChange(){
	enforceChildrenOrder = document.getElementById("chkOrder").checked;

	const next = getNextUncompletedTask();
	updateNotAllowedOnChkChange(root, next, enforceChildrenOrder);
	
	updateNotAllowed();
	root.collapseDescendants();
	next.expandWrapper();
}
function hideCompletedChange(){
	hideCompletedTasks = document.getElementById("chkHideComplete").checked;
	
	const tasks = document.getElementsByClassName("completed");
	for(let index in tasks){
		if(!tasks[index].classList){continue;}
		tasks[index].classList.toggle('hide', hideCompletedTasks);
	}
	
	
	if(!hideCompletedTasks){
		root.collapseDescendants();
		if(currentTask){
			currentTask.expandWrapper();
		}
	}
}


function showSettings(){
	settingsArea.classList.add('settingsExpanded');
}
function hideSettings(){
	settingsArea.classList.remove('settingsExpanded');
}

function showRoutines(){
	routineArea.classList.add('routineAreaExpanded');
}
function hideRoutines(){
	routineArea.classList.remove('routineAreaExpanded');
}

function includesClass(element, className){
	if(!element.classList){return false;}
	return [...element.classList].includes(className)
}
function updateHeight(div, task){
	if(!div || div.tagName !== "DIV" || div.id === "taskArea"){return;}
	
	const height = task.countDescendants() * 65;
	div.style.maxHeight = height+"px";
}
function updateNotAllowed(){
	if(!autoAdvanceChildren && !enforceChildrenOrder){return;}
	const next = getNextUncompletedTask();
	if(!next){return;}
	
	next.btn.classList.remove('notAllowed');
	let p = next.parent;
	while(p){
		p.btn.classList.remove('notAllowed');
		p = p.parent;
	}
}
function resetUncompleted(){
	for(let index in root.children){
		const child = root.children[index];
		child.resetDescendants();
	}
	updateNotAllowed();
}
function routineClick(routine){
	routine.select();
	if(!autoAdvanceChildren){
		resetUncompleted();
	}
}
function taskClick(task) {
	if(autoAdvanceChildren || includesClass(task.btn, 'completed')){ return; }
	if(enforceChildrenOrder){
		const next = getNextUncompletedTask();
		if(next && next !== task && !next.isDescendant(task)){return;}
	}

	resetUncompleted();
	task.select();
}
function autoAdvance(){
	if(!autoAdvanceChildren){return;}
	const next = getNextUncompletedTask();
	if(next){
		next.select();
		next.expandWrapper();
		//next.select();
		//startTimer();
	}
}

function formatTime(totalMilliseconds) {
	const minutes = parseInt(totalMilliseconds / 60000, 10).toString().padStart(2, '0');
	const seconds = parseInt((totalMilliseconds % 60000) / 1000, 10).toString().padStart(2, '0');
	const remainder = parseInt((totalMilliseconds % 1000) / 10, 10).toString().padEnd(2, '0');
	
	return `${minutes}:${seconds}.${remainder}`;
}
function startTimer(){
	if(timerInterval){return;}
	
	if(currentTime === 0){
		currentTime =  Date.now() + currentTask.time - currentTask.started
	}
	timerInterval = setInterval(updateTimer, 45);
	startStopTimer.textContent = "Stop";
}
function stopTimer(){
	clearInterval(timerInterval);
	timerInterval = null;
	startStopTimer.textContent = "Start";
}
function startStop(){
	if(timerInterval){
		stopTimer();
	}
	else{
		startTimer();
	}
}
function updateTimer(){
	if(!currentTask){return;}
	const remaining = currentTask.started + currentTime - Date.now();
	if(remaining < 0){
		timerDisplay.textContent = formatTime(0);
		
		stopTimer(); 
		if(autoAdvanceChildren){
			completeCurrentTask();
			autoAdvance();
		}
		return;
	}
	
	timerDisplay.textContent = formatTime(remaining);
}
function resetTimer(){
	currentTime = 0;
	timerDisplay.textContent = formatTime(currentTask?currentTask.time:0);
	stopTimer();
}

function completeCurrentTask(){
	if(!currentTask){return;}
	doneBtn.classList.add('hide');
	remindBtn.classList.add('hide');
	currentTask.complete();
	updateNotAllowed();
	
	if(loopTimeout){
		clearTimeout(loopTimeout);
	}
}
function placeFloatButtons(){
	const hasDoneBtn = !autoAdvanceChildren && currentTask && currentTask.btn;
	
	const r = currentTask.btn.getBoundingClientRect();
	remindBtn.style.left = (r.right + (hasDoneBtn?50:0))+"px";
	remindBtn.style.top = r.top+"px";
	remindBtn.style.height = r.height+"px";
	
	remindBtn.classList.remove('hide');
	
	if(!hasDoneBtn){return;}
	doneBtn.style.left = r.right+"px";
	doneBtn.style.top = r.top+"px";
	doneBtn.style.height = r.height+"px";
	
	doneBtn.classList.remove('hide');
}

function remind(){
	currentTask.reminders++;
}

function audioEnded() {
	isAudioPlaying = false;
	if(loopAudio){
		loopTimeout = setTimeout(() => currentTask.playAudio(), loopDelay); 
	}
}
function audioError(id) {
	console.log("Audio not found:" + id);
	isAudioPlaying = false;
}

function createSubTaskDiv(parent, id){
	const div = document.createElement('div');
	div.id = `${id}D`;
	div.classList.add('subtaskDiv');
	
	parent.appendChild(div);
	return div;
}
function createTask(parentDiv, taskID, index, parentTask){
	const temp = tasks.filter(x => x.id === taskID);
	if(temp.length === 0){return null;}
	const t = temp[0];
	const newTask = new task(Number(index)+1, t.text, t.time, t.audio, parentTask);
	parentDiv.appendChild(newTask.btn);
	
	return newTask;
}
function loadTasks(parentDiv, taskIDs, parentTask){
	for(let index in taskIDs){
		const t = taskIDs[index];
		const newTask = createTask(parentDiv, t.id, index, parentTask);
		
		if(t.tasks && t.tasks.length > 0){
			const d = createSubTaskDiv(parentDiv, newTask.btn.id);
			loadTasks(d, t.tasks, newTask);
		}
	}
}

function getNextUncompletedTask(){
	return root.getNextUncompletedDescendant();
}

function routine(id, name, audio, theme, loopAudio, loopDelay, autoAdvanceChildren, enforceChildrenOrder, hideCompletedTasks, tasks){
	this.id = id;
	this.name = name;
	if(audio) {
		this.audio = new Audio(`.\\audio\\${audio}.mp3`);
		this.audio.addEventListener('ended', () => audioEnded(this.id));
		this.audio.addEventListener('error', () => audioError(this.id));
	}
	this.theme = theme;
	this.loopAudio = loopAudio || false;
	this.loopDelay = loopDelay || 0;
	this.autoAdvanceChildren = autoAdvanceChildren || false;
	this.enforceChildrenOrder = enforceChildrenOrder || false;
	this.hideCompletedTasks = hideCompletedTasks || false;
	this.tasks = tasks || [];
	
	this.btn = document.createElement('button');
	this.btn.id = `Routine_${id}`;
	this.btn.textContent = name;
	this.btn.addEventListener('click', () => routineClick(this));
	this.btn.classList.add("routine");
}
routine.prototype.playAudio = function(){
	if(this.audio){
		isAudioPlaying = true;
		this.audio.play();
	}
}
routine.prototype.select = function(){
	if(currentRoutine && !routineCompleted){
		if(currentRoutine === this ||
			!confirm("You currently have an active routine. Do you want to switch?")){
			hideRoutines();
			return;
		}
	}
	
	loopAudio = this.loopAudio;
	loopDelay = this.loopDelay;
	autoAdvanceChildren = this.autoAdvanceChildren;
	enforceChildrenOrder = this.enforceChildrenOrder;
	hideCompletedTasks = this.hideCompletedTasks;
	
	document.getElementById("chkLoop").checked = loopAudio;
	document.getElementById("numDelay").value = loopDelay/1000;
	document.getElementById("chkAuto").checked = autoAdvanceChildren;	
	document.getElementById("chkOrder").checked = enforceChildrenOrder;
	document.getElementById("chkHideComplete").checked = hideCompletedTasks;	

	root.text = this.name;
	this.playAudio();
	routineStarted = Date.now();
	currentRoutine = this;
	hideRoutines();
	routineName.textContent = this.name;
	
	completedTable.replaceChildren();
	taskArea.replaceChildren();
	root.children = [];
	loadTasks(taskArea, this.tasks, root);
	
	document.getElementById("rightSide").classList.remove('hide');
	document.getElementById("settingsBtn").classList.remove('hide');
	
	completedData = [];

	if(autoAdvanceChildren){
		autoAdvance();
		updateNotAllowed();
	}
}

function task(id, text, time, audio, parent) {
	this.id = id;//used to make the btn.id
	this.parent = parent;
	if(parent){
		parent.children.push(this);
	}
	
	this.text = text;
	this.btn = document.createElement('button');
	this.btn.id = this.buildID();
	this.btn.textContent = text;
	this.btn.addEventListener('click', () => taskClick(this));
	this.btn.classList.add("task");
	this.btn.classList.add("unstarted");
	
	if(autoAdvanceChildren || enforceChildrenOrder){
		this.btn.classList.add('notAllowed');
	}
	
	this.time = time*1000 || 0;
	if(audio) {
		this.audio = new Audio(`.\\audio\\${audio}.mp3`);
		this.audio.addEventListener('ended', () => audioEnded(this.id));
		this.audio.addEventListener('error', () => audioError(this.id));
	}
	
	this.children = [];
	this.started = 0;
	this.completed = 0;
	this.reminders = 0;
}
task.prototype.playAudio = function(){
	if(loopTimeout){
		clearTimeout(loopTimeout);
	}
	if(this.audio){
		isAudioPlaying = true;
		this.audio.play();
		
		if(this.started === 0){ this.started = Date.now(); }
	}
}
task.prototype.buildID = function(){
	let output = this.id;
	let p = this.parent;
	while(p != null && p.id !== "taskArea"){
		output = `${p.id}_${output}`;
		p = p.parent;
	}
	return output;
}
task.prototype.siblings = function(){
	if(!this.parent){return [];}
	
	return this.parent.children;
}
task.prototype.select = function(){
	//if completed do nothing
	if(includesClass(this.btn, 'completed')){return;}

	doneBtn.classList.add('hide');
	remindBtn.classList.add('hide');
	const previousTask = currentTask;
	currentTask = null;
	
	//if sibling has child tasks and none are completed collapse 
	const siblings = this.siblings();
	for(let index in siblings){
		const sib = siblings[index];
		if(includesClass(sib.btn, 'completed')){continue;}
		
		if(hideCompletedTasks || !sib.hasCompletedDescendant()){
			sib.collapseDescendants();
		}
	}
	
	//expand this one
	if(this.children && this.children.length > 0){
		const div = document.getElementById(`${this.btn.id}D`);
		if(div){
			updateHeight(div, this);
			//TODO: play subtask audio
		}
		this.expandWrapper();
	}
	else{
		setTimeout(placeFloatButtons, 500);
	}

	this.setCurrent();
	currentTime = this.time;
	startTimer();
	updateTimer();
	this.playAudio();
}
task.prototype.complete = function(){
	//if children not done is not done.
	if(this.children.some(x => x.completed===0)){ return; }
	
	//mark task complete
	this.completed = Date.now();
	this.btn.classList.remove('current');
	this.btn.classList.add('completed');
	
	if(hideCompletedTasks)
	{
		this.btn.classList.add('hide');
	}
	
	//if has child task div collapse it.
	const div = document.getElementById(`${this.btn.id}D`);
	if(div){
		div.style.removeProperty('max-height');
	}
	
	const taskNum = this.btn.id.replace("root_","").replaceAll("_",".").replace("root", "Routine");

	const newRow = {
		taskNum: taskNum,
		name: this.text,
		started: this.started,
		completed: this.completed,
		duration: formatTime(this.completed - this.started),
		reminders:this.descendantReminders()
	};
	addTableRow(newRow);

	//if there is no parent this is the root and we all done here.
	if(!this.parent){
		routineCompleted = Date.now();
		stopTimer();
		timerDisplay.textContent = formatTime(0);
		return;
	}
	completedArea.classList.remove('hide');
	currentTask = null;
	stopTimer();
	resetTimer();

	//check parent
	this.parent.complete();
	if(!autoAdvanceChildren && !this.parent.completed){
		this.parent.setCurrent();
	}
}
task.prototype.getNextUncompletedDescendant = function(){
		if(this.completed === 0 && this.children.length === 0){
		return this;
	}
	
	for(let i=0;i<this.children.length;i++){
		const next = this.children[i].getNextUncompletedDescendant();
		if(next){return next;}
	}
	
	return null;
}
task.prototype.setCurrent = function(){
	if(includesClass(this.btn, 'current')){return;}
	
	if(!currentTask){
		currentTask = this;
		//TODO: set image
	}
	
	this.started = this.started || Date.now();
	this.btn.classList.remove('unstarted');
	this.btn.classList.add('current');
	currentTime = this.time;
	
	if(!this.parent){return;}
	this.parent.setCurrent();
}
task.prototype.resetDescendants = function(){
	if(this.completed > 0){return;}
	
	this.btn.classList.add('unstarted');
	this.btn.classList.remove('current');
	
	if(autoAdvanceChildren || enforceChildrenOrder){
		this.btn.classList.add('notAllowed');
	}
	
	for(let index in this.children){
		this.children[index].resetDescendants();
	}
}
task.prototype.hasCompletedDescendant = function(){
	return this.children.some(x => x.completed !==0)
	|| this.children.some(x => x.hasCompletedDescendant());
}
task.prototype.expandWrapper = function(){
	const parentNode = this.btn.parentNode
	if(parentNode){
		updateHeight(parentNode, this.parent);
	}
	
	if(this.parent){
		this.parent.expandWrapper();
	}
}
task.prototype.isDescendant = function(checkTask){
	let p = this.parent;
	while(p){
		if(p === checkTask){return true;}
		p = p.parent;
	}
	return false;
}
task.prototype.countDescendants = function(){
	let total = this.children.length;
	for(let i=0;i<this.children.length;i++){
		total += this.children[i].countDescendants();
	}
	return total;
}
task.prototype.collapseDescendants = function(){
	const div = document.getElementById(`${this.btn.id}D`);
	if(div){
		div.style.removeProperty('max-height');
	}
	
	for(let index in this.children){
		this.children[index].collapseDescendants();
	}
}
task.prototype.descendantReminders = function(){
	let reminders = this.reminders;
	this.children.forEach(x => {reminders += x.descendantReminders()});
	return reminders;
}

const root = new task('root', null, null, null, null);
function init(){
	routineName = document.getElementById("routineName");
	startStopTimer = document.getElementById("startStop");
	timerDisplay = document.getElementById("timerDisplay");
	routineArea = document.getElementById("routineArea");
	settingsArea = document.getElementById("settingsArea");
	taskArea = document.getElementById("taskArea");
	doneBtn = document.getElementById("btnDone");
	remindBtn = document.getElementById("btnRemind");	
	completedTable = document.getElementById("completedTable");
	completedArea = document.getElementById("completedArea");

	for(let index in routines){
		const r = routines[index];
		availableRoutines.push(new routine(r.id, r.name, r.audio, r.theme, r.loopAudio, r.loopDelay, r.autoAdvanceChildren, r.enforceChildrenOrder, r.hideCompletedTasks, r.tasks));
	}
	
	for(let index in availableRoutines){
		const r = availableRoutines[index];
		routineArea.appendChild(r.btn);
	}
}

//make Isaiah's morning routine

//save data in local storage

//export
	//CSV
	//base64

//import base64

//task images
//routine images

//themes

//graphs
//For a single day:
	//flame graph
	//waterfall
	//bar
	//pie chart of leaves
//Over time
	//x-day/y-task time
	//x-day/y-task reminders

