"use strict";

let availableRoutines = [];
let routineArea = null;
let rightMenu = null;
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
		
		newRow.title = `Allocated: ${formatTime(rowData.allocated)}`;
		if((rowData.completed - rowData.started) > rowData.allocated){
			newRow.style.color = "#F22";
		}
		
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
	
	durationCell.style.textAlign = "center";

	newRow.title = `Allocated: ${formatTime(rowData.allocated)}`;
	if((rowData.completed - rowData.started) > (rowData.allocated+500)){//allow a bit of slop tollerance
		newRow.style.color = "#F22";
	}

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
function setTheme(theme){
	//get all the links
	const links = document.getElementsByTagName('link');
	
	for(let i=0;i<links.length;i++){
		const link = links.item(i);
		//these don't get toggled.
		if(link.rel !== 'stylesheet' || link.href.endsWith('Base.css')){continue;}
		
		//set the theme!
		if(link.href.includes(theme)){
			link.removeAttribute('disabled');
		}
		else{
			link.setAttribute('disabled', null);
		}
	}
}

function themeChange(){
	//TODO: setTheme(whatever was selected)
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

function showRightMenu(){
	rightMenu.classList.add('rightMenuExpanded');
}
function hideRightMenu(){
	rightMenu.classList.remove('rightMenuExpanded');
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
	
	const taskHeight = alpha.children[0].btn.getBoundingClientRect().height + 10;
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
	if(!currentTask || currentTask.children.length !== 0){return;}
	const r = currentTask.btn.getBoundingClientRect();
	const offset = window.scrollY;
	
	const H = window.innerHeight;
	const W = window.innerWidth;
	
	//center floaty on button if some theme has phat borders
	const heightOffset = (alpha.children[0].btn.getBoundingClientRect().height - 90)/2;
	const top = r.top + offset + heightOffset;
	const left = r.right + 10;
	
	if(left + 390 < W){
		floatyButtons.style.top = top+"px";
		floatyButtons.style.left = left+"px";
		
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
	const newTask = new task(taskID, Number(index)+1, t.text, t.time, t.audio, t.icon, parentTask);
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
	if(icon){this.icon = `url('./icons/${icon}')`;}
	if(audio){this.audio = new Audio(`.\\audio\\${audio}.mp3`);}
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
	autoAdvanceDone = this.autoAdvanceDone;
	enforceChildrenOrder = this.enforceChildrenOrder;
	hideCompletedTasks = this.hideCompletedTasks;
	
	if(this.icon){
		document.getElementById("routineImage").style.backgroundImage = this.icon;
	}
	routineName.textContent = this.name;
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
	
	completedTable.replaceChildren();
	taskArea.replaceChildren();
	alpha.children = [];
	loadTasks(taskArea, this.tasks, alpha);
	
	document.getElementById("settingsArea").classList.remove('hide');
	floatyButtons.classList.add('hide');
	stopTimer();
	currentTime = 0;
	
	completedData = [];
	
	if(this.theme){
		setTheme(this.theme);
	}
	else{setTheme('Light');}
	
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

function task(taskID, id, text, time, audio, icon, parent) {
	this.taskID = taskID;//used to look up task
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
		id: this.taskID,
		taskNum: taskNum,
		name: this.text,
		started: this.started,
		completed: this.completed,
		duration: formatTime(this.completed - this.started),
		allocated: this.time,
		reminders:this.descendantReminders()
	};
	addTableRow(newRow);
	
	//if there is no parent this is the alpha and we all done here.
	if(!this.parent){
		routineCompleted = Date.now();
		stopTimer();
		timerDisplay.textContent = formatTime(0);
		Storage.saveCurrent();
		return;
	}
	completedArea.classList.remove('hide');
	previousTask = currentTask || previousTask;
	currentTask = null;
	stopTimer();
	resetTimer();
	
	//check parent
	this.parent.complete();
	
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


//Some hacked together save/load data to try to minimize storage space required.
//Eventually this might just be in a DB so I won't need to save/load this rubbish
const cBase = 93;
const cOffset = 33;
function stringToInt(input){
	if(input === "¿"){return -1;}
	let output = 0;
	
	const chars = input.split('');
	for(let i=0;i<chars.length;i++){
		output *= cBase;
		output += chars[i].charCodeAt() - cOffset;
	}
	
	return output;
}
function intToString(input){
	if(input === -1){return "¿";}
	
	let output = String.fromCharCode((input % cBase) + cOffset);
	input = Math.floor(input/cBase);
	
	while(input > 0){
		output = String.fromCharCode((input % cBase) + cOffset) + output;
		input = Math.floor(input/cBase);
	}
	
	return output;
}
function buildCurrentSave(){
	const epoch = new Date().setHours(0,0,0,0);
	const newData = [];
	newData.push(intToString(epoch));
	
	for(let i=0;i<completedData.length;i++){
		const c = completedData[i];
		newData.push(`${intToString(c.id)} ${intToString(c.started-epoch)} ${intToString(c.completed-epoch)} ${intToString(c.reminders)}`);
	}
	
	return newData.join('│');
}
function loadSave(input){
	if(input.length === 0){return null;}
	input = input.split('│');
	
	const epoch = stringToInt(input[0]);
	const output = [];
	
	for(let i=1;i<input.length;i++){
		const temp = input[i].split(" ");
		if(temp.length != 4){continue;}
		
		const id = stringToInt(temp[0]);
		const start = stringToInt(temp[1]) + epoch;
		const done = stringToInt(temp[2]) + epoch;
		const reminders = stringToInt(temp[3]);
		
		output.push({id:id, started: start, completed:done, reminders:reminders});
	}
	
	return output;
}

function exportClick(){
	Storage.export64();
}
function importClick(){
	Storage.import64();
}

function importFile(e)
{
	//if localstorage exists confirm overwrite
	if(localStorage.getItem('ATL') 
		&& !confirm('This will overwrite existing local storage. Click OK to continue.')){
		document.getElementById('import').value = null;
		return;
	}

	const f = e.target.files;
	if(!f || f.length === 0){return;}
	Storage.import64(f[0]);
}

function importData(input){
	const data = {};
	for(const [key, value] of Object.entries(input)){
		data[key] = {};
		for(let i=0;i<value.length;i++){
			const record = loadSave(value[i]);
			const root = record.find(x => x.id===-1);
			data[key][root.started] = record;
		}
	}
	
	return data;
}
function storage(){
	const temp = JSON.parse(localStorage.getItem('ATL'));
	if(!temp){return;}
	
	this.data = importData(temp);
}
storage.prototype.saveCurrent = function(){
	const temp = JSON.parse(localStorage.getItem('ATL')) || {};
	if(!temp[currentRoutine.id]){
		temp[currentRoutine.id] = [];
	}
	
	const saveData = buildCurrentSave();
	temp[currentRoutine.id].push(saveData);

	localStorage.setItem('ATL', JSON.stringify(temp));
}
storage.prototype.export64 = function(){
	const str = localStorage.getItem('ATL');
	const temp = btoa(encodeURIComponent(str));
	const d = new Date();
	const name = `ATL_export_${d.getUTCFullYear()}_${d.getMonth()}_${d.getDate()}.txt`;

    const dl = document.createElement('a');
    document.body.appendChild(dl);

    dl.href = `data:application/pdf;base64,${temp}`;
    dl.target = '_self';
    dl.download = name;
    dl.click(); 
}
storage.prototype.import64 = function(file){
	
	const reader = new FileReader();
	reader.onload = function(event){
		const text = decodeURIComponent(event.target.result);
		const temp = JSON.parse(text);
		this.data = importData(temp);
		
		alert("Data Imported");
		document.getElementById('import').value = null;
	}
	
	reader.readAsText(file);
}

const Storage = new storage();
const alpha = new task(-1, "alpha", null, null, null, null);
function init(){
	window.addEventListener('resize', placeFloatButtons);
	
	routineName = document.getElementById("routineName");
	startStopTimer = document.getElementById("startStop");
	timerDisplay = document.getElementById("timerDisplay");
	timerArea = document.getElementById("timer");
	routineArea = document.getElementById("routineArea");
	rightMenu = document.getElementById("rightMenu");
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
	
	//document.getElementById('import').addEventListener('change', getFile)

}


//graphs
//For a single day:
//flame graph
//waterfall
//bar
//pie chart of leafs
//Over time
//x-day/y-task time
//x-day/y-task reminders


//routine reminder limit? - set row red if over limit

//Themes
//		<link id="cssLight" rel="stylesheet" type="text/css" href="../Light.css" disabled />
//ligher colors; default theme
//dark border
//no background picture
//		<link id="cssDark" rel="stylesheet" type="text/css" href="../Dark.css" disabled />
//darker colors
//light border
//no background picture
//		<link id="cssDinosaurs" rel="stylesheet" type="text/css" href="../Dinosarus.css" disabled />
//Dinosaur egg shaped buttons
//Dinosaur in lower right
//		<link id="cssFlowers" rel="stylesheet" type="text/css" href="../Flowers.css" disabled />
//Flowers/stems border
//butterfly lower right
//		<link id="cssRainbows" rel="stylesheet" type="text/css" href="../Rainbows.css" disabled />
//Rainbow border
//unicorn lower right
//		<link id="cssSpace" rel="stylesheet" type="text/css" href="../Space.css" disabled />
// stars border
//moon picture background
//		<link id="cssSports" rel="stylesheet" type="text/css" href="../Sports.css" disabled />
//sports balls/bats border
//sports balls in corner
//		<link id="cssTransportation" rel="stylesheet" type="text/css" href="../Transportation.css" disabled />
//train tracks/roads for borders
//train picture in lower right


//Update demo routines
//default
//Loop Audio
//next task when complete: just new audio files
//hide completed
//audio previxes
//audio suffixes
//task completion audio
//time expired audio

//demo icons

//themes

