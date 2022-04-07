"use strict";

const taskHeight = 95;//used for sizing subtask div heights
let availableRoutines = [];
let routineArea = null;
let settingsArea = null;
let completedArea = null;
let completedTable = null;
let timerArea = null;
let routineName = null;
let taskArea = null;
let floatyButtons = null;
let doneBtn = null;
let remindArea = null;
let currentReminds = null;

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
let lastCycle = 0;

let loopAudio = false;
let loopDelay = 10;
let autoAdvanceTimer = false;
let autoAdvanceDone = false;
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
	if(!loopAudio && loopTimeout){
		clearTimeout(loopTimeout);
	}
}
function loopDelayChange(){
	loopDelay = document.getElementById("numDelay").value * 1000;
}
function autoTimerAdvanceChange(){
	autoAdvanceTimer = document.getElementById("chkAutoTimer").checked;
	
	if(!autoAdvanceTimer){return;}
	if(currentTime){return;}//don't advance until time runs out
	
	alpha.collapseDescendants();
	const next = getNextUncompletedTask(previousTask);
	if(next){
		next.expandWrapper();
		next.select();
		next.expandWrapper();
	}
}
function autoDoneAdvanceChange(){
	autoAdvanceDone = document.getElementById("chkAutoDone").checked;
	
	if(!autoAdvanceDone){return;}
	if(currentTask){return;}//don't advance until done is clicked
	
	alpha.collapseDescendants();
	const next = getNextUncompletedTask(previousTask);
	if(next){
		next.expandWrapper();
		next.select();
		next.expandWrapper();
	}
}
function enforceOrderChange(){
	enforceChildrenOrder = document.getElementById("chkOrder").checked;
	
	const next = getNextUncompletedTask(previousTask);
	if(next){
		updateNotAllowedOnChkChange(alpha, next, enforceChildrenOrder);
		
		updateNotAllowed();
		alpha.collapseDescendants();
		next.expandWrapper();
	}
}
function hideCompletedChange(){
	hideCompletedTasks = document.getElementById("chkHideComplete").checked;
	
	const tasks = document.getElementsByClassName("completed");
	for(let index in tasks){
		if(!tasks[index].classList){continue;}
		tasks[index].classList.toggle('hide', hideCompletedTasks);
	}
	
	
	if(!hideCompletedTasks){
		alpha.collapseDescendants();
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
	
	const height = task.countDescendants() * taskHeight;
	div.style.maxHeight = height+"px";
}
function updateNotAllowed(){
	if(!enforceChildrenOrder){return;}
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
	for(let index in alpha.children){
		const child = alpha.children[index];
		child.resetDescendants();
	}
	updateNotAllowed();
}
function routineClick(routine){
	routine.select();
	if(!autoAdvanceTimer){
		resetUncompleted();
	}
}
function taskClick(task) {
	if(includesClass(task.btn, 'completed')){ return; }
	if(enforceChildrenOrder){
		const next = getNextUncompletedTask();
		if(next && next !== task && !next.isDescendant(task)){return;}
	}
	
	resetUncompleted();
	task.select();
}
function autoAdvance(){
	if((!autoAdvanceTimer && ! autoAdvanceDone) 
	|| currentRoutine.audioEncouragement){return;}
	const next = getNextUncompletedTask(previousTask);
	if(next){
		next.select();
		next.expandWrapper();
	}
}

function formatTime(totalMilliseconds) {
	const minutes = parseInt(totalMilliseconds / 60000, 10).toString().padStart(2, '0');
	const seconds = parseInt((totalMilliseconds % 60000) / 1000, 10).toString().padStart(2, '0');
	const remainder = parseInt((totalMilliseconds % 1000) / 10, 10).toString().padEnd(2, '0');
	
	return `${minutes}:${seconds}`;//.${remainder}`;
}
function startTimer(){
	if(timerInterval){return;}
	
	if(currentTime === 0 && currentTask){
		currentTime =  currentTask.time;
	}
	lastCycle = Date.now();
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
	const now = Date.now();
	currentTime-= now - lastCycle;
	lastCycle = now;
	if(currentTime < 0){
		currentTime = 0;
		stopTimer(); 
		
		if(autoAdvanceTimer){
			completeCurrentTask();
			autoAdvance();
		}
		else{
			currentRoutine.playTimeExpiredAudio();
		}
	}
	
	timerDisplay.textContent = formatTime(currentTime);
}
function resetTimer(){
	currentTime = 0;
	timerDisplay.textContent = formatTime(currentTask?currentTask.time:0);
	stopTimer();
}

function clickDone(){
	const task = currentTask;
	completeCurrentTask();
	if(autoAdvanceDone){
		autoAdvance();
	}
}
function completeCurrentTask(){
	if(!currentTask){return;}
	floatyButtons.classList.add('hide');
	currentTask.complete();
	updateNotAllowed();
	
	if(loopTimeout){
		clearTimeout(loopTimeout);
	}
}
function placeFloatButtons(){
	if(!currentTask){return;}
	const r = currentTask.btn.getBoundingClientRect();
	const offset = window.scrollY;
	
	const H = window.innerHeight;
	const W = window.innerWidth;
	
	const top = r.top + offset;
	const left = r.right + 10;
	
	if(left + 390 < W){
		floatyButtons.style.top = (r.top + offset)+"px";
		floatyButtons.style.left = (r.right + 10)+ "px";
		
		floatyButtons.style.removeProperty('position');
		floatyButtons.style.removeProperty('padding');
		floatyButtons.style.removeProperty('right');
		floatyButtons.style.removeProperty('bottom');
		floatyButtons.style.removeProperty('border');
	}
	else{
		floatyButtons.style.position = "fixed";
		floatyButtons.style.bottom = "10px";
		floatyButtons.style.right = "10px";
		floatyButtons.style.border = "solid 2px #000";
		floatyButtons.style.padding = "10px";

		floatyButtons.style.removeProperty('left');
		floatyButtons.style.removeProperty('top');
	}
	
	
	floatyButtons.classList.remove('hide');
	doneBtn.classList.toggle('hide', autoAdvanceTimer);
}

function remind(){
	if(!currentTask){return;}
	currentTask.reminders++;
	currentReminds.textContent = currentTask.reminders;
	currentTask.playAudio();
}

function audioPrefixEnded(){
	if(currentTask){
		currentTask.playAudio();
	}
}
function audioEnded() {
	if(currentRoutine.playTaskAudioSuffix()){return;}
	if(loopAudio && currentTask){
		loopTimeout = setTimeout(() => currentTask.playAudio(), loopDelay); 
	}
}
function audioSuffixEnded(){
	if(loopAudio && currentTask){
		loopTimeout = setTimeout(() => currentTask.playAudio(), loopDelay); 
	}
}
function audioEncouragementEnded(){
	if(!autoAdvanceTimer && ! autoAdvanceDone){return;}
	const next = getNextUncompletedTask(previousTask);
	if(next){
		next.select();
		next.expandWrapper();
	}
}
function audioError(id) {
	console.log("Audio not found:" + id);
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
	const newTask = new task(Number(index)+1, t.text, t.time, t.audio, t.icon, parentTask);
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

function getFirstUncompletedLeaf(){
	return alpha.getNextUncompletedDescendant();
}

function getNextUncompletedTask(task){
	if(!task || !task.parent){return getFirstUncompletedLeaf();}
	const index = task.parent.children.indexOf(task)+1;
	
	for(let i=index;i<task.parent.children.length;i++){
		const child = task.parent.children[i];
		const next = child.getNextUncompletedDescendant();
		if(next){return next;}
	}
	
	if(task.parent){return getNextUncompletedTask(task.parent);}
}

function routine(id, name, icon, audio, taskAudioPrefix, taskAudioSuffix, audioEncouragement, timeExpiredAudio, theme, loopAudio, loopDelay, autoAdvanceTimer, autoAdvanceDone, enforceChildrenOrder, hideCompletedTasks, tasks){
	this.id = id;
	this.name = name;
	this.icon = `url('./icons/${icon}')`;
	
	if(audio) {
		this.audio = new Audio(`.\\audio\\${audio}.mp3`);
	}
	if(taskAudioPrefix){
		this.taskAudioPrefix = new Audio(`.\\audio\\${taskAudioPrefix}.mp3`);
		this.taskAudioPrefix.addEventListener('ended', () => audioPrefixEnded());
		this.taskAudioPrefix.addEventListener('error', () => audioError(this.id));
	}
	if(taskAudioSuffix){
		this.taskAudioSuffix = new Audio(`.\\audio\\${taskAudioSuffix}.mp3`);
		this.taskAudioSuffix.addEventListener('ended', () => audioSuffixEnded());
		this.taskAudioSuffix.addEventListener('error', () => audioError(this.id));
	}
	if(audioEncouragement){
		this.audioEncouragement = new Audio(`.\\audio\\${audioEncouragement}.mp3`);
		this.audioEncouragement.addEventListener('ended', () => audioEncouragementEnded());
		this.audioEncouragement.addEventListener('error', () => audioError(this.id));
	}
	if(timeExpiredAudio){
		this.timeExpiredAudio = new Audio(`.\\audio\\${timeExpiredAudio}.mp3`);
		this.timeExpiredAudio.addEventListener('error', () => audioError(this.id));
	}
	
	this.theme = theme;
	this.loopAudio = loopAudio || false;
	this.loopDelay = loopDelay*1000 || 0;
	this.autoAdvanceTimer = autoAdvanceTimer || false;
	this.autoAdvanceDone = autoAdvanceDone || false;
	this.enforceChildrenOrder = enforceChildrenOrder || false;
	this.hideCompletedTasks = hideCompletedTasks || false;
	this.tasks = tasks || [];
	
	this.btn = document.createElement('div');
	this.btn.id = `Routine_${id}`;
	
	if(icon){
		const img = document.createElement("div");
		img.classList.add('btnIcon');
		img.style.backgroundImage=`url(./icons/${icon})`;
		this.btn.appendChild(img);
	}

	if(name){
		const txt = document.createElement('div');
		txt.classList.add('routineText');
		txt.textContent = name;
		this.btn.appendChild(txt);
	}
	
	this.btn.addEventListener('click', () => routineClick(this));
	this.btn.classList.add("routine");
}
routine.prototype.playAudio = function(){
	if(this.audio){
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
	autoAdvanceTimer = this.autoAdvanceTimer;
	enforceChildrenOrder = this.enforceChildrenOrder;
	hideCompletedTasks = this.hideCompletedTasks;
	
	document.getElementById("routineImage").style.backgroundImage = this.icon;
	document.getElementById("chkLoop").checked = loopAudio;
	document.getElementById("numDelay").value = loopDelay/1000;
	document.getElementById("chkAutoTimer").checked = autoAdvanceTimer;	
	document.getElementById("chkAutoDone").checked = autoAdvanceTimer;	
	document.getElementById("chkOrder").checked = enforceChildrenOrder;
	document.getElementById("chkHideComplete").checked = hideCompletedTasks;	
	
	alpha.text = this.name;
	this.playAudio();
	routineStarted = Date.now();
	currentRoutine = this;
	hideRoutines();
	routineName.textContent = this.name;
	
	completedTable.replaceChildren();
	taskArea.replaceChildren();
	alpha.children = [];
	loadTasks(taskArea, this.tasks, alpha);
	
	document.getElementById("settingsBtn").classList.remove('hide');
	floatyButtons.classList.add('hide');
	stopTimer();
	currentTime = 0;
	
	completedData = [];
	
	if(autoAdvanceTimer){
		autoAdvance();
	}
}
routine.prototype.playTaskAudioPrefix = function(){
	if(this.taskAudioPrefix){
		this.taskAudioPrefix.play();
		return true;
	}
	return false;
}
routine.prototype.playTaskAudioSuffix = function(){
	if(this.taskAudioSuffix){
		this.taskAudioSuffix.play();
		return true;
	}
	return false;
}
routine.prototype.playEncouragement = function(){
	if(this.audioEncouragement){
		this.audioEncouragement.play();
		return true;
	}
	return false;
}
routine.prototype.playTimeExpiredAudio = function(){
	if(this.timeExpiredAudio){
		this.timeExpiredAudio.play();
		return true;
	}
	return false;	
}

function task(id, text, time, audio, icon, parent) {
	this.id = id;//used to make the btn.id
	this.parent = parent;
	if(parent){
		parent.children.push(this);
	}
	
	this.text = text;
	this.btn = document.createElement('div');
	this.btn.id = this.buildID();

	if(icon){
		const img = document.createElement("div");
		img.classList.add('btnIcon');
		img.style.backgroundImage=`url(./icons/${icon})`;
		this.btn.appendChild(img);
	}

	if(text){
		const txt = document.createElement('div');
		txt.classList.add('taskText');
		txt.textContent = text;
		this.btn.appendChild(txt);
	}
	this.btn.addEventListener('click', () => taskClick(this));
	this.btn.classList.add("task");
	this.btn.classList.add("unstarted");
	
	if(enforceChildrenOrder){
		this.btn.classList.add('notAllowed');
	}
	
	this.time = time*1000 || 0;
	if(audio) {
		this.audio = new Audio(`.\\audio\\${audio}.mp3`);
		this.audio.addEventListener('ended', () => audioEnded());
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
		this.audio.play();
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
	
	floatyButtons.classList.add('hide');
	previousTask = currentTask || previousTask;
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
	currentReminds.textContent = this.reminders;
	
	this.setCurrent();
	currentTime = this.time;
	startTimer();
	updateTimer();
	if(!currentRoutine.playTaskAudioPrefix()){this.playAudio();}
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
	
	const taskNum = this.btn.id.replace("alpha_","").replaceAll("_",".").replace("alpha", "Routine");
	
	const newRow = {
		taskNum: taskNum,
		name: this.text,
		started: this.started,
		completed: this.completed,
		duration: formatTime(this.completed - this.started),
		reminders:this.descendantReminders()
	};
	addTableRow(newRow);
	
	//if there is no parent this is the alpha and we all done here.
	if(!this.parent){
		routineCompleted = Date.now();
		stopTimer();
		timerDisplay.textContent = formatTime(0);
		return;
	}
	completedArea.classList.remove('hide');
	previousTask = currentTask || previousTask;
	currentTask = null;
	stopTimer();
	resetTimer();
	
	//check parent
	this.parent.complete();
	// if(!autoAdvanceTimer && !this.parent.completed){
	// this.parent.setCurrent();
	// }
	
	currentRoutine.playEncouragement();
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
	
	if(enforceChildrenOrder){
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

//renamed this to alpha because root was conflicting with some of wife's addons
const alpha = new task('alpha', null, null, null, null, null);
function init(){
	window.addEventListener('resize', placeFloatButtons);
	
	routineName = document.getElementById("routineName");
	startStopTimer = document.getElementById("startStop");
	timerDisplay = document.getElementById("timerDisplay");
	timerArea = document.getElementById("timer");
	routineArea = document.getElementById("routineArea");
	settingsArea = document.getElementById("settingsArea");
	taskArea = document.getElementById("taskArea");
	floatyButtons = document.getElementById("floatyButtons");
	doneBtn = document.getElementById("btnDone");
	remindArea = document.getElementById("remindArea");	
	completedTable = document.getElementById("completedTable");
	completedArea = document.getElementById("completedArea");
	currentReminds = document.getElementById("currentReminds");
	
	for(let index in routines){
		const r = routines[index];
		availableRoutines.push(new routine(r.id, r.name, r.icon,
			r.audio, r.taskAudioPrefix, r.taskAudioSuffix, r.audioEncouragement, r.timeExpiredAudio,
		r.theme, r.loopAudio, r.loopDelay, r.autoAdvanceTimer, r.autoAdvanceDone, r.enforceChildrenOrder, r.hideCompletedTasks, r.tasks));
	}
	
	const taskIDs = tasks.map(x => {return {id:x.id}});
	availableRoutines.push(new routine(-1, "All Tasks", null, null, null, null, null, null, null, null, null, null, null, null, null, taskIDs));
	
	for(let index in availableRoutines){
		const r = availableRoutines[index];
		routineArea.appendChild(r.btn);
	}
}

//demo icons
//demo with audio prefix
//demo with audio suffix
//demo with encouragement
//demo with time expired audio

//save data in local storage
//export
	//CSV
	//base64

//import base64

//themes

//graphs
//For a single day:
	//flame graph
	//waterfall
	//bar
	//pie chart of leafs
//Over time
	//x-day/y-task time
	//x-day/y-task reminders
	
