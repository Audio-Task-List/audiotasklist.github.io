"use strict";

let availableRoutines = [];
let routineArea = null;
let rightMenu = null;
let timerArea = null;
let undoArea = null;
let routineName = null;
let taskArea = null;
let floatyButtons = null;
let doneBtn = null;
let remindArea = null;
let currentReminds = null;
let graphModal = null;

let currentRoutine = null;
let currentTask = null;
let lastCompletedTask = null;

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
let isEncouraging = false;

let completedData = [];
let sortCol = 'taskNum';
let sortAsc = true;

const diagnostics = [];
function dPush(input){
	diagnostics.push(input);
	document.getElementById('txtDiagnostics').value += '\r\n'+input;
}
function dClear(){
	diagnostics.length = 0;
	document.getElementById('txtDiagnostics').value = '';
}
function displayDiagnostics(){
	document.getElementById('txtDiagnostics').value = diagnostics.join('\r\n');
	document.getElementById('diagnosticsArea').classList.toggle('hide');
	
	hideRightMenu();
	hideRoutines();
}
function windowError(message, source, lineno, colno, error){
	dPush('##############################################');
	dPush("WINDOW ERROR");
	dPush(message);
	dPush(`${source} ${lineno}:${colno}`);
	dPush(error);
	dPush('##############################################');
}
function elementError(e){
	dPush('##############################################');
	dPush("ELEMENT ERROR");
	dPush(e.message);
	dPush(e.stack);
	dPush('##############################################');
}

function clearChildNodes(id){
	const e = document.getElementById(id);
	while(e.firstChild){
		e.removeChild(e.lastChild);
	}
}
function replaceAll(input, find, replace){
	while(input.includes(find)){
		input = input.replace(find, replace);
	}
	return input;
}

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
	clearChildNodes("completedTable");
	const tempData = [...completedData];
	completedData = [];
	
	for(let i=0;i<tempData.length;i++){
		addTableRow(tempData[i])
	}
}
function addTableRow(rowData){
	try{
		dPush('addRow');
		let index = 0;
		while(index < completedData.length && sortData(completedData[index], rowData) === (sortAsc?-1:1))
		{
			index++;
		}
		
		completedData.splice(index, 0, rowData);
		const newRow = document.getElementById('completedTable').insertRow(index);
		const numCell = newRow.insertCell();
		const nameCell = newRow.insertCell();
		const durationCell = newRow.insertCell();
		const reminderCell = newRow.insertCell();
		
		durationCell.style.textAlign = "center";
		reminderCell.style.textAlign = "center";
		
		const a = rowData.allocated?`Allocated: ${formatTime(rowData.allocated)}`:'';
		const c = currentRoutine.reminderLimit?`Reminder Limit: ${currentRoutine.reminderLimit}`:'';
		const b = a&&c?'\n':'';
		newRow.title = `${a}${b}${c}`;
		if((rowData.allocated && (rowData.completed - rowData.started) > (rowData.allocated+500)) || 
			(currentRoutine.reminderLimit && rowData.reminders > currentRoutine.reminderLimit)){
			newRow.style.color = "#F22";
		}
		
		numCell.textContent = rowData.taskNum;
		nameCell.textContent = rowData.name;
		durationCell.textContent = rowData.duration;
		reminderCell.textContent = rowData.reminders;
		
		dPush(`\tRow Data: ${rowData.taskNum} ${rowData.name} ${rowData.duration}/${formatTime(rowData.allocated)} ${rowData.reminders}`);
	}
	catch(e){
		elementError(e);
	}
	
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

function changeBackgroundColor(sender, className){
	setClassProperty(className, 'background-color', sender.value);
}
function changeColor(sender, className){
	setClassProperty(className, 'color', sender.value);
}
function setClassProperty(className, property, value){
	if(value === null){return;}
	const stylesheet = document.styleSheets[1];
	let rule;
	for(let i = 0; i < stylesheet.cssRules.length; i++) {
		if(stylesheet.cssRules[i].selectorText === className) {
			rule = stylesheet.cssRules[i];
		}
	}
	
	if(!rule){
		stylesheet.insertRule(`${className}{${property}:${value}}`,0);
		return;
	}
	rule.style.setProperty(property, value);
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
	if(theme.contentWrapper){
		if(theme.contentWrapper.bg){
			setClassProperty(".contentWrapper", "background-color", theme.contentWrapper.bg);
			document.getElementById("bgContentWrapper").value = theme.contentWrapper.bg;
		}
		
		if(theme.contentWrapper.c){
			setClassProperty(".contentWrapper", "color", theme.contentWrapper.c);
			document.getElementById("cContentWrapper").value = theme.contentWrapper.c;
		}
	}
	if(theme.unstarted)
	{
		if(theme.unstarted.bg){
			setClassProperty(".unstarted", "background-color", theme.unstarted.bg);
			document.getElementById("bgUnstarted").value = theme.unstarted.bg;
		}
		
		if(theme.unstarted.c){
			setClassProperty(".unstarted", "color", theme.unstarted.c);
			document.getElementById("cUnstarted").value = theme.unstarted.c;
		}
	}
	if(theme.current){
		if(theme.current.bg){
			setClassProperty(".current", "background-color", theme.current.bg);
			document.getElementById("bgCurrent").value = theme.current.bg;
		}
		
		if(theme.current.c){
			setClassProperty(".current", "color", theme.current.c);
			document.getElementById("cCurrent").value = theme.current.c;
		}
	}
	if(theme.completed){
		if(theme.completed.bg){
			setClassProperty(".completed", "background-color", theme.completed.bg);
			document.getElementById("bgCompleted").value = theme.completed.bg;
		}
		
		if(theme.completed.c){
			setClassProperty(".completed", "color", theme.completed.c);
			document.getElementById("cCompleted").value = theme.completed.c;
		}
	}
	if(theme.notAllowed){
		if(theme.notAllowed.bg){
			setClassProperty(".notAllowed", "background-color", theme.notAllowed.bg);
			document.getElementById("bgNotAllowed").value = theme.notAllowed.bg;
		}
		
		if(theme.notAllowed.c){
			setClassProperty(".notAllowed", "color", theme.notAllowed.c);
			document.getElementById("cNotAllowed").value = theme.notAllowed.c;
		}
	}
}

function toggleCSSFile(input) {
	//get all the links
	const links = document.getElementsByTagName('link');
	
	for(let i=0;i<links.length;i++){
		const link = links.item(i);
		//these don't get toggled.
		if(link.rel !== 'stylesheet' || link.href.endsWith('Base.css')){continue;}
		
		//set the files!
		if(link.href.includes(input)){
			link.removeAttribute('disabled');
		}
		else{
			link.setAttribute('disabled', null);
		}
	}
}

function loopChange(){
	loopAudio = document.getElementById("chkLoop").checked;
	if(loopAudio && currentTask){
		loopTimeout = setTimeout(() => currentTask.playAudio(), loopDelay); 
	}
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
	const next = getNextUncompletedTask(lastCompletedTask);
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
	const next = getNextUncompletedTask(lastCompletedTask);
	if(next){
		next.expandWrapper();
		next.select();
		next.expandWrapper();
	}
}
function enforceOrderChange(){
	enforceChildrenOrder = document.getElementById("chkOrder").checked;
	
	const next = getNextUncompletedTask(lastCompletedTask);
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
	dPush(`Auto Advance: ${autoAdvanceTimer} ${autoAdvanceDone}`);
	if((!autoAdvanceTimer && ! autoAdvanceDone) 
	|| currentRoutine.audioEncouragement){return;}
	const next = getNextUncompletedTask(lastCompletedTask);
	
	dPush('\tNext Task: ' + next.text);
	
	if(next){
		next.select();
		next.expandWrapper();
	}
}

function dateFormat(input){
	if(!input){input = new Date();}
	const M = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	return `${input.getFullYear()} ${M[input.getMonth()]} ${input.getDate().toString().padStart(2, '0')} - ${input.getHours().toString().padStart(2, '0')}:${input.getMinutes().toString().padStart(2, '0')}`;
}
function formatTime(totalMilliseconds, showCentiseconds=false) {
	const minutes = parseInt(totalMilliseconds / 60000, 10).toString().padStart(2, '0');
	const seconds = parseInt((totalMilliseconds % 60000) / 1000, 10).toString().padStart(2, '0');
	const remainder = parseInt((totalMilliseconds % 1000) / 10, 10).toString().padEnd(2, '0');
	
	if(showCentiseconds){return `${minutes}:${seconds}.${remainder}`;}
	return `${minutes}:${seconds}`;
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

function undoLastComplete(){
	try{
	if(!lastCompletedTask || !lastCompletedTask.completed){return;}
	
	if(currentTask){
		currentTask.started = 0; 
		currentTask.btn.classList.remove('current');
		currentTask.btn.classList.add('unstarted');
		currentTask.collapseDescendants();
	}
	
	const taskNum = lastCompletedTask.taskNum();
	if(taskNum === 'Routine'){return;}
	completedData = completedData.filter(x => x.taskNum !== taskNum);
	sortCompletedData();
	
	lastCompletedTask.completed=0; 
	lastCompletedTask.btn.classList.remove('completed');
	lastCompletedTask.btn.classList.remove('hide');
	
	let p = lastCompletedTask.parent;
	while(p && p.completed > 0){
		p.completed=0; 
		p.btn.classList.remove('completed');
		p.btn.classList.add('current');
		p.expandWrapper();
		
		p = p.parent;
	}
	
	resetUncompleted();
	lastCompletedTask.expandWrapper();
	lastCompletedTask.select();
	
	currentTime = currentTask.time - (Date.now() - currentTask.started);
	lastCompletedTask = null;
	undoArea.classList.add('hide');
	} 
	catch(e){elementError(e);}
}
function clickDone(){
	try{
		dPush('clickDone: ' + autoAdvanceDone)
		const task = currentTask;
		completeCurrentTask();
		if(autoAdvanceDone){
			autoAdvance();
		}
	}
	catch(e){elementError(e);}
}
function completeCurrentTask(){
	try{
		if(!currentTask){return;}
		dPush('completeCurrentTask: ' + currentTask.text);
		floatyButtons.classList.add('hide');
		currentTask.complete();
		updateNotAllowed();
		
		if(loopTimeout){
			clearTimeout(loopTimeout);
		}
	}
	catch(e){
		elementError(e);
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
	const min = (lastCompletedTask && (r.right + 600) > W) ? 150 : 0;
	const top = Math.max(r.top + offset + heightOffset, min);
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
	try{
	if(!currentTask){return;}
	currentTask.reminders++;
	currentReminds.textContent = currentTask.reminders;
	
	//play current reminders audio
	const reminder = new Audio(`..\\audio\\${Math.min(currentTask.reminders,4)}reminder.mp3`);
	reminder.addEventListener('ended', () => currentTask.playAudio());
	reminder.play();
	} catch(e){elementError(e);}
}

function audioPrefixEnded(){
	try{
		if(currentTask){
			currentTask.playAudio();
		}
	}
	catch(e){elementError(e);}
}
function audioEnded() {
	try{
		if(currentRoutine && currentRoutine.playTaskAudioSuffix()){return;}
		if(loopAudio && currentTask){
			loopTimeout = setTimeout(() => {if(currentTask){currentTask.playAudio()}}, loopDelay); 
		}
	}
	catch(e){elementError(e);}
}
function audioSuffixEnded(){
	try{
		if(loopAudio && currentTask){
			loopTimeout = setTimeout(() => currentTask.playAudio(), loopDelay); 
		}
	}
	catch(e){elementError(e);}
}
function audioEncouragementEnded(){
	try{
		if(!autoAdvanceTimer && ! autoAdvanceDone){return;}
		isEncouraging = false;
		const next = getNextUncompletedTask(lastCompletedTask);
		if(next){
			next.select();
			next.expandWrapper();
		}
	}
	catch(e){elementError(e);}
	
}
function audioError(id) {
	console.log("Audio not found:" + id);
}

function createSubTaskDiv(parent, id){
	if(!parent){return null;}
	const div = document.createElement('div');
	div.id = `${id}D`;
	div.classList.add('subtaskDiv');
	
	parent.appendChild(div);
	return div;
}
function createTask(parentDiv, taskID, index, parentTask){
	dPush(`\t\tCreate Task: ${taskID}`);
	const temp = tasks.filter(x => x.id === taskID);
	if(temp.length === 0){return null;}
	const t = temp[0];
	dPush(`\t\t\t${t.text}`);
	
	const newTask = new task(taskID, Number(index)+1, t.text, t.time, t.audio, t.icon, parentTask);
	if(parentDiv) {
		parentDiv.appendChild(newTask.btn);
	}
	
	return newTask;
}
function loadTasks(parentDiv, taskIDs, parentTask){
	dPush('\tLoad Tasks: ' + parentTask.text);
	for(let index in taskIDs){
		const t = taskIDs[index];
		const newTask = createTask(parentDiv, t.id, index, parentTask);
		if(t.tasks && t.tasks.length > 0){
			const d = createSubTaskDiv(parentDiv, newTask.btn.id);
			loadTasks(d, t.tasks, newTask);
		}
	}
}

function createTaskLite(taskID, index, parentTask){
	dPush(`\t\tCreate Task Lite: ${taskID}`);
	const temp = tasks.filter(x => x.id === taskID);
	if(temp.length === 0){return null;}
	const t = temp[0];
	dPush(`\t\t\t${t.text}`);
	
	const newTask = new task(taskID, Number(index)+1, t.text, t.time, t.audio, t.icon, parentTask, true);
	
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

function getFirstUncompletedLeaf(){
	return alpha.getNextUncompletedDescendant();
}
function getNextUncompletedTask(task){
	try{
		if(!task || !task.parent){return getFirstUncompletedLeaf();}
		const index = task.parent.children.indexOf(task)+1;
		
		for(let i=index;i<task.parent.children.length;i++){
			const child = task.parent.children[i];
			const next = child.getNextUncompletedDescendant();
			if(next){return next;}
		}
		
		if(task.parent){return getNextUncompletedTask(task.parent);}
	}
	catch(e){
		elementError(e);
	}
	
}

function routine(id, name, icon, audio, taskAudioPrefix, taskAudioSuffix, audioEncouragement, timeExpiredAudio, reminderLimit, theme, loopAudio, loopDelay, autoAdvanceTimer, autoAdvanceDone, enforceChildrenOrder, hideCompletedTasks, tasks){
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
	
	this.reminderLimit = reminderLimit;
	
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
	try{
		if(this.audio){
			
			try{
				this.audio.play();
			}
			catch(e){
				//expected on page load/restore in progress.
			}
		}
	}
	catch(e){
		elementError(e);
	}
}
routine.prototype.select = function(){
	try{
		dClear();
		dPush('Select Routine: '+this.name);
		if(currentRoutine && !alpha.completed){
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
		alpha.started = Date.now();
		currentRoutine = this;
		hideRoutines();
		
		clearChildNodes("completedTable");
		clearChildNodes("taskArea");
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
		
		if(autoAdvanceTimer){
			autoAdvance();
		}
		
		dPush('\tRoutine Started');
	}
	catch(e){
		elementError(e);
	}
}
routine.prototype.playTaskAudioPrefix = function(){
	try{
		if(this.taskAudioPrefix){
			this.taskAudioPrefix.play();
			return true;
		}
		return false;
	}
	catch(e){
		elementError(e);
	}
}
routine.prototype.playTaskAudioSuffix = function(){
	try{
		if(this.taskAudioSuffix){
			this.taskAudioSuffix.play();
			return true;
		}
		return false;
	}
	catch(e){
		elementError(e);
	}
}
routine.prototype.playEncouragement = function(){
	try{
		if(this.audioEncouragement){
			isEncouraging = true;
			this.audioEncouragement.play();
			return true;
		}
		return false;
	}
	catch(e){
		elementError(e);
	}
}
routine.prototype.playTimeExpiredAudio = function(){
	try{
		if(this.timeExpiredAudio){
			this.timeExpiredAudio.play();
			return true;
		}
		return false;	
	}
	catch(e){
		elementError(e);
	}
}

function task(taskID, id, text, time, audio, icon, parent, isLite=false) {
	this.taskID = taskID;//used to look up task
	this.id = id;//used to make the btn.id
	this.parent = parent;
	if(parent){
		parent.children.push(this);
	}
	
	this.text = text;
	
	this.children = [];
	this.started = 0;
	this.completed = 0;
	this.reminders = 0;
	this.time = time*1000 || 0;

	this.btn = document.createElement('div');
	this.btn.id = this.buildID();

	if(isLite){return;}

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
	
	if(audio) {
		this.audio = new Audio(`.\\audio\\${audio}.mp3`);
		this.audio.addEventListener('ended', () => audioEnded());
		this.audio.addEventListener('error', () => audioError(this.id));
	}
	
}
task.prototype.playAudio = function(){
	try{
		if(loopTimeout){
			clearTimeout(loopTimeout);
		}
		if(this.audio){
			this.audio.play();
		}
	}
	catch(e){
		elementError(e);
	}
	
}
task.prototype.buildID = function(){
	try{
		let output = this.id.toString().padStart(2,'0');
		let p = this.parent;
		while(p != null && p.id !== "taskArea"){
			output = `${p.id.toString().padStart(2,'0')}_${output}`;
			p = p.parent;
		}
		return output;
	}catch(e){elementError(e);}
}
task.prototype.siblings = function(){
	try{
		if(!this.parent){return [];}
		
		return this.parent.children;
	}catch(e){elementError(e);}
	
}
task.prototype.select = function(){
	try{
		dPush('Task Selected: ' + this.btn.id);
		//if completed do nothing
		if(includesClass(this.btn, 'completed') || isEncouraging){return;}
		
		floatyButtons.classList.add('hide');
		currentTask = null;
		undoArea.classList.toggle('hide', !lastCompletedTask)
		
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
		dPush('\tTask Started: ' + this.text);
	}
	catch(e){
		elementError(e);
	}
	
}
task.prototype.taskNum = function(){
	try{
		let id = (this.btn.id || '').replace("Routine_","");
		id = replaceAll(id,"_",".");
		return id;
	}catch(e){elementError(e);}
	
}
task.prototype.completedRow = function(){
	return {
		id: this.taskID,
		taskNum: this.taskNum(),
		name: this.text,
		started: this.started,
		completed: this.completed,
		duration: formatTime(this.completed - this.started),
		allocated: this.time,
		reminders:this.descendantReminders()
	};
}
task.prototype.complete = function(){
	try{
		dPush('Task.Complete: ' + this.text);
		//if children not done is not done.
		if(this.children.some(x => x.completed===0)){ return; }
		
		//mark task complete
		this.completed = Date.now();
		this.btn.classList.remove('current');
		this.btn.classList.add('completed');
		lastCompletedTask = this;
		
		if(hideCompletedTasks)
		{
			this.btn.classList.add('hide');
		}
		
		//if has child task div collapse it.
		const div = document.getElementById(`${this.btn.id}D`);
		if(div){
			div.style.removeProperty('max-height');
		}
		
		const newRow = this.completedRow();
		dPush('\tAdd Completed Row: ' + JSON.stringify(newRow));
		addTableRow(newRow);
		if(currentRoutine){
			currentRoutine.playEncouragement();
		}

		document.getElementById("completedArea").classList.remove('hide');
		undoArea.classList.toggle('hide', !lastCompletedTask )
		
		//if there is no parent this is the alpha and we all done here.
		if(!this.parent){
			//alpha.completed = Date.now();
			dPush('\tRoutine Completed');
			stopTimer();
			timerDisplay.textContent = formatTime(0);
			Storage.saveCurrent();
			currentRoutine = null;
			localStorage.removeItem('InProgress');
			lastCompletedTask = null;
			undoArea.classList.add('hide');
			return;
		}
		else{
			const saveData = {routine:currentRoutine.id ,tasks:buildCurrentSave()};
			localStorage.setItem('InProgress', JSON.stringify(saveData));
		}
		currentTask = null;
		stopTimer();
		resetTimer();
		
		//check parent
		this.parent.complete();
	}
	catch(e){
		elementError(e);
	}
	
}
task.prototype.getNextUncompletedDescendant = function(){
	try{
		if(this.completed === 0 && this.children.length === 0){
			return this;
		}
		
		for(let i=0;i<this.children.length;i++){
			const next = this.children[i].getNextUncompletedDescendant();
			if(next){return next;}
		}
		
		return null;
	}catch(e){elementError(e);}
	
}
task.prototype.setCurrent = function(){
	try{
		if(includesClass(this.btn, 'current')){return;}
		
		if(!currentTask){
			currentTask = this;
		}
		
		this.started = this.started || Date.now();
		this.btn.classList.remove('unstarted');
		this.btn.classList.add('current');
		currentTime = this.time;
		
		if(!this.parent){return;}
		this.parent.setCurrent();
	}catch(e){elementError(e);}
}
task.prototype.resetDescendants = function(){
	try{
		if(this.completed > 0){return;}
		
		this.btn.classList.add('unstarted');
		this.btn.classList.remove('current');
		
		if(enforceChildrenOrder){
			this.btn.classList.add('notAllowed');
		}
		
		for(let index in this.children){
			this.children[index].resetDescendants();
		}
	}catch(e){elementError(e);}
}
task.prototype.hasCompletedDescendant = function(){
	try{
		return this.children.some(x => x.completed !==0)
		|| this.children.some(x => x.hasCompletedDescendant());
	}catch(e){elementError(e);}
}
task.prototype.expandWrapper = function(){
	try{
		const parentNode = this.btn.parentNode
		if(parentNode){
			updateHeight(parentNode, this.parent);
		}
		
		if(this.parent){
			this.parent.expandWrapper();
		}
	}catch(e){elementError(e);}
}
task.prototype.isDescendant = function(checkTask){
	try{
		let p = this.parent;
		while(p){
			if(p === checkTask){return true;}
			p = p.parent;
		}
		return false;
	}catch(e){elementError(e);}
}
task.prototype.countDescendants = function(){
	try{
		let total = this.children.length;
		for(let i=0;i<this.children.length;i++){
			total += this.children[i].countDescendants();
		}
		return total;
	}catch(e){elementError(e);}
}
task.prototype.collapseDescendants = function(){
	try{
		const div = document.getElementById(`${this.btn.id}D`);
		if(div){
			div.style.removeProperty('max-height');
		}
		
		for(let index in this.children){
			this.children[index].collapseDescendants();
		}
	}catch(e){elementError(e);}
}
task.prototype.descendantReminders = function(){
	try{
		let reminders = this.reminders;
		this.children.forEach(x => {reminders += x.descendantReminders()});
		return reminders;
	}catch(e){elementError(e);}
}

//Some hacked together save/load data to try to minimize storage space required.
//Eventually this might just be totaly refactored and stored in a DB?
const cBase = 93;
const cOffset = 33;
function stringToInt(input){
	if(!input){return 0};
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
	const epoch = Math.min(...completedData.map(x=>x.started));
	const newData = [];
	newData.push(intToString(epoch));
	
	for(let i=0;i<completedData.length;i++){
		const c = completedData[i];
		newData.push(`${intToString(c.id)} ${c.taskNum} ${intToString(c.allocated/1000)} ${intToString(c.started-epoch)} ${intToString(c.completed-epoch)} ${intToString(c.reminders)}`);
	}
	
	return newData.join('│');
}
function loadSave(input){
	if(input.length === 0){return null;}
	input = input.split('│');
	
	const epoch = stringToInt(input[0]);
	const output = {epoch: epoch, data:[]};
	
	for(let i=1;i<input.length;i++){
		const temp = input[i].split(" ");
		if(temp.length != 6){continue;}
		
		const id = stringToInt(temp[0]);
		const taskNum = temp[1];
		const allocated = stringToInt(temp[2])*1000;
		const start = stringToInt(temp[3]);
		const done = stringToInt(temp[4]);
		const reminders = stringToInt(temp[5]);
		
		output.data.push({id:id, taskNum:taskNum, allocated:allocated, started: start, completed:done, reminders:reminders});
	}
	
	return output;
}

function findTaskByNum(parent, taskNum){
	if(parent.btn.id===taskNum){return parent;}
	for(let i=0;i<parent.children.length;i++){
		const temp = findTaskByNum(parent.children[i], taskNum);
		if(temp !== null){return temp;}
	}
	return null;
}
function restoreInProgress(){
	const temp = JSON.parse(localStorage.getItem('InProgress'));
	if(temp === null){return;}
	const inProgress = availableRoutines.find(x => x.id === temp.routine);
	if(inProgress){inProgress.select();}
	
	const data = loadSave(temp.tasks);
	alpha.started = data.epoch;
	
	for(let i=0;i<data.data.length;i++){
		const datum = data.data[i];
		const task = tasks.find(x => x.id===datum.id);

		console.log("I", i, datum, task);

		const taskNum = `Routine_${replaceAll(datum.taskNum,'.','_')}`;
		const routineTask = findTaskByNum(alpha, taskNum);
		console.log("TN", taskNum, routineTask);
		if(!routineTask){continue;}
		
		routineTask.started = datum.started;
		routineTask.completed = datum.completed;
		routineTask.reminders = datum.reminders;
		routineTask.btn.classList.add('completed');
		routineTask.btn.classList.remove('unstarted');
		
		//add to completed table
		const newRow = {
			id: datum.id,
			taskNum: datum.taskNum,
			name: task.text,
			started: datum.started,
			completed: datum.completed,
			duration: formatTime(datum.completed - datum.started),
			allocated: task.time*1000,
			reminders:datum.reminders
		};
		addTableRow(newRow);
	}
	document.getElementById("completedArea").classList.remove('hide');
	document.getElementById('inProgress').classList.add('hide');
}

function exportClick(){
	Storage.export64();
}
function importClick(){
	Storage.import64();
}

function importFile(e){
	//if localstorage exists confirm overwrite
	if(localStorage.getItem('ATL') 
		&& !confirm('This will overwrite existing local storage. Click OK to continue.')){
		document.getElementById('import').value = null;
		return;
	}
	
	try{
		const f = e.target.files;
		if(!f || f.length === 0){return;}
		for(let i=0;i<f.length;i++){
			Storage.import64(f[i]);
		}
		alert("Data imported");
		document.getElementById('import').value = null;
	} catch(e){
		alert("Error importing data");
		console.error(e);
	}
}
function clearStorage(){
	if(confirm("Do you want to clear all stored data?")){
		localStorage.clear();
		alert("Data cleared");
	}
}
let isPrimitive = (input) => {
	return input === null 
	|| typeof input === 'undefined'
	|| typeof input === 'number'
	|| typeof input === 'string'
	|| typeof input === 'bitint'
	|| typeof input === 'boolean'
	|| typeof input === 'symbol';
}
function merge(a, b){
	for(const [key, value] of Object.entries(b)){
		if(!a.hasOwnProperty(key)){
			a[key]=value;
		}
		else if(!isPrimitive(value)){
			merge(a[key], b[key]);
		}
	}
}
function importData(input){
	const data = {};
	for(const [key, value] of Object.entries(input)){
		data[key] = {};
		for(let i=0;i<value.length;i++){
			const record = loadSave(value[i]);
			data[key][record.epoch] = record.data;
		}
	}
	
	return data;
}
function storage(){
	this.data = {};
	this.importData();
}
storage.prototype.importData = function(){
	const temp = JSON.parse(localStorage.getItem('ATL'));
	if(!temp){return;}
	
	this.data = importData(temp);
}
storage.prototype.saveCurrent = function(){
	try{
		const temp = JSON.parse(localStorage.getItem('ATL')) || {};
		if(!temp[currentRoutine.id]){
			temp[currentRoutine.id] = [];
		}
		
		const saveData = buildCurrentSave();
		temp[currentRoutine.id].push(saveData);
		
		localStorage.setItem('ATL', JSON.stringify(temp));
		this.data = importData(temp);//fix this to be less bad.
	}catch(e){elementError(e);}
}
storage.prototype.export64 = function(){
	try{
		const saveData = {};
		for(let [rID, value] of Object.entries(this.data)){
			const routineData = [];
			for(let [epoch, completedData] of Object.entries(value)){
				const saveDatums = [];
				saveDatums.push(intToString(epoch));
				for(let i=0;i<completedData.length;i++){
					const c = completedData[i];
					saveDatums.push(`${intToString(c.id)} ${c.taskNum} ${intToString(c.allocated/1000)} ${intToString(c.started)} ${intToString(c.completed)} ${intToString(c.reminders)}`);
				}
				routineData.push(saveDatums.join('│'));
			}
			saveData[rID] = routineData;
		}
		const str = JSON.stringify(saveData);
		const temp = btoa(encodeURIComponent(str));
		const name = `ATL_export_${dateFormat()}.txt`;
		
		const dl = document.createElement('a');
		document.body.appendChild(dl);
		
		dl.href = `data:text/plain;charset=utf-8,${temp}`;
		dl.target = '_self';
		dl.download = name;
		dl.click(); 
		
		dl.remove();
	}catch(e){elementError(e);}
}
storage.prototype.import64 = function(file){
	try{
		const reader = new FileReader();
		reader.onload = function(event){
			const text = decodeURIComponent(event.target.result);
			const temp = JSON.parse(text);
			
			const newData = importData(temp);
			merge(this.data, newData);
			
			alert("Data Imported");
			document.getElementById('import').value = null;
		}
		
		reader.readAsText(file);
	}catch(e){elementError(e);}
}
storage.prototype.appendData = function(routineID, data){
	try{
		if(!this.data[routineID]){
			this.data[routineID] = [];
		}
		for(let i=0;i<data.length;i++){
			this.data[routineID][data[i].epoch] = data[i].data;
		}
	}catch(e){elementError(e);}
}

const Storage = new storage();
const alpha = new task(-1, "Routine", null, null, null, null);
function init(){
	try{
		dPush('Init Starting');
		window.addEventListener('resize', placeFloatButtons);
		
		routineName = document.getElementById("routineName");
		startStopTimer = document.getElementById("startStop");
		timerDisplay = document.getElementById("timerDisplay");
		timerArea = document.getElementById("timer");
		undoArea = document.getElementById("undoArea");
		routineArea = document.getElementById("routineArea");
		rightMenu = document.getElementById("rightMenu");
		taskArea = document.getElementById("taskArea");
		floatyButtons = document.getElementById("floatyButtons");
		doneBtn = document.getElementById("btnDone");
		remindArea = document.getElementById("remindArea");	
		currentReminds = document.getElementById("currentReminds");
		graphModal = document.getElementById("graphModalWrapper");
		
		for(let index in routines){
			const r = routines[index];
			availableRoutines.push(new routine(r.id, r.name, r.icon,
				r.audio, r.taskAudioPrefix, r.taskAudioSuffix, r.audioEncouragement, r.timeExpiredAudio, r.reminderLimit,
			r.theme, r.loopAudio, r.loopDelay, r.autoAdvanceTimer, r.autoAdvanceDone, r.enforceChildrenOrder, r.hideCompletedTasks, r.tasks));
		}
		
		const taskIDs = tasks.map(x => {return {id:x.id}});
		availableRoutines.push(new routine(-1, "All Tasks", null, null, null, null, null, null, null, null, null, null, null, null, null, null, taskIDs));
		
		for(let index in availableRoutines){
			const r = availableRoutines[index];
			routineArea.appendChild(r.btn);
		}
		
		if(localStorage.getItem('InProgress') !== null){
			document.getElementById('inProgress').classList.remove('hide');
		}
		
		dPush('\tInit Complete');
	}catch(e){elementError(e);}
	
}

window.onbeforeunload = function(){
	if(currentRoutine){
		return 'You are in a routine. Do you want to exit?';
	}
};

