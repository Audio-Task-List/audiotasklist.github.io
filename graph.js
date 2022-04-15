"use strict";

//graphs
//For a single Instance:
/*
	flame graph
	waterfall
	pie chart of leafs
	bar?
*/
//Over time
/*
	x-day/y-task time
	x-day/y-task reminders
*/
const instanceGraphs = ['flame', 'waterfall', 'pie'];
const graphLeafs = ['pie', 'time', 'reminders'];

let graphRoutineArea = null;
let graphInstanceArea = null;
let graphType = null;
let selectedRoutine = null;
let selectedInstance = null;
let w = 0;
let h = 0;
const graphData = new GraphData();

function dateFormat(input){
	const M = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	return `${input.getDate().toString().padStart(2, '0')} ${M[input.getMonth()]} ${input.getFullYear()} - ${input.getHours().toString().padStart(2, '0')}:${input.getMinutes().toString().padStart(2, '0')}`;
}

function selectGraphType(value){
	graphType = value;
	selectedRoutine = null;
	selectedInstance = null;
	document.getElementById('generateGraph').classList.add('hide');
	document.getElementById("graphData").classList.add('hide');
	
	graphRoutineArea = graphRoutineArea || document.getElementById("graphRoutine");
	graphInstanceArea = graphInstanceArea || document.getElementById("graphInstance");
	
	//populate routines
	const ddl = document.getElementById('selectGraphRoutine');
	ddl.replaceChildren();
	
	const o = document.createElement('option');
	o.setAttribute('selected', null);
	o.setAttribute('disabled', null);
	o.setAttribute('hidden', null);
	o.textContent = "Select Routine";
	ddl.appendChild(o);
	
	
	for(let i=0;i<availableRoutines.length;i++){
		const r = availableRoutines[i];
		if(r.id === -1){continue;}
		
		const o = document.createElement('option');
		o.setAttribute('value', r.id);
		o.textContent = r.name;
		ddl.appendChild(o);
	}
	
	graphRoutineArea.classList.remove('hide');
	graphInstanceArea.classList.add('hide');
}

function selectGraphRoutine(value){
	selectedRoutine = parseInt(value);
	selectedInstance = null;
	
	const instanceGraph = instanceGraphs.includes(graphType);
	document.getElementById('generateGraph').classList.toggle('hide', instanceGraph);
	graphInstanceArea.classList.toggle('hide', !instanceGraph);
	
	if(!instanceGraph){ return; }
	
	//populate instances of routine
	const ddl = document.getElementById('selectGraphInstance');
	ddl.replaceChildren();
	
	const o = document.createElement('option');
	o.setAttribute('selected', null);
	o.setAttribute('disabled', null);
	o.setAttribute('hidden', null);
	o.textContent = "Select Instance";
	ddl.appendChild(o);
	
	const i = Storage.data[value];
	if(!i){
		alert("No instances recorded for selected routine.");
		return;
	}
	
	const keys = Object.keys(i);
	for(let i=0;i<keys.length;i++){
		const key = keys[i];
		const d = new Date(parseInt(key, 10));
		
		const o = document.createElement('option');
		o.setAttribute('value', key);
		o.textContent = dateFormat(d);
		ddl.appendChild(o);
	}
}

function selectGraphRoutineInstance(value){
	selectedInstance = value;
	document.getElementById('generateGraph').classList.remove('hide');
}

function tasksMaxDepth(tasks){
	if(!tasks){return 0;}
	return 1 + Math.max(...tasks.map(x => tasksMaxDepth(x.tasks)));
}

function GraphData(){
	this.minY = 0;
	this.maxY = 0;
	this.minX = 0;
	this.maxX = 0;
	
	this.DataPoints = [];
}

function DataPoint(instance, taskID, taskNum, x, y){
	this.instance = instance;
	this.task = tasks.find(x => x.id === taskID);
	this.taskNum = taskNum;
	this.x = x;
	this.y = y;
}

function filterLeaf(input){
	return input.filter(x => {
		const childNum = x.taskNum+'.';
		return !input.some(y => y.taskNum.startsWith(childNum));
	});
}
function filterRoutineLeafs(input){
	const keys = Object.keys(input);
	const output = {};
	for(const i in keys){
		output[keys[i]] = filterLeaf(input[keys[i]]);
	}
	return output;
}

function buildFlameData(){
	const data = Storage.data[selectedRoutine][selectedInstance];
	
	const base = data.find(x => x.id===-1);
	if(!base){return;}
	const r = routines.find(x => x.id === selectedRoutine);
	
	graphData.maxX = base.completed - base.started;
	graphData.maxY = tasksMaxDepth(r.tasks);
	
	for(let i=0;i<data.length;i++){
		if(data[i].id === -1){continue;}
		graphData.DataPoints.push(new DataPoint(null, data[i].id, data[i].taskNum, data[i].started-base.started, data[i].completed-base.started));
	}
}
function buildWaterfallData(){
	const data = Storage.data[selectedRoutine][selectedInstance];

	const base = data.find(x => x.id===-1);
	if(!base){return;}
	
	graphData.maxX = base.completed - base.started;
	graphData.maxY = data.length - 1;
	
	for(let i=0;i<data.length;i++){
		if(data[i].id === -1){continue;}
		graphData.DataPoints.push(new DataPoint(null, data[i].id, data[i].taskNum, data[i].started-base.started, data[i].completed-base.started));
	}
}
function buildPieData(){
	const data = Storage.data[selectedRoutine][selectedInstance];

	const base = data.find(x => x.id===-1);
	if(!base){return;}
	
	graphData.maxX = base.completed - base.started;
	graphData.maxY = 0;
	
	const filtered = filterLeaf(data);
	for(let i=0;i<filtered.length;i++){
		if(filtered[i].id === -1){continue;}
		graphData.DataPoints.push(new DataPoint(null, filtered[i].id, filtered[i].taskNum, filtered[i].started-base.started, filtered[i].completed-base.started));
	}
}
function buildTimeData(){
	const data = Storage.data[selectedRoutine];
	const filtered = filterRoutineLeafs(data);
	const keys = Object.keys(filtered);
	graphData.maxX = keys.length;
	graphData.maxY = Math.max(...Object.keys(filtered).map(x => Math.max(...filtered[x].map(y => y.completed-y.started))))
	
	for(let i=0;i<keys.length;i++){
		const key = keys[i];
		const temp = filtered[key];
		const base = temp.find(x => x.id===-1);
		
		for(let j=0;j<temp.length;j++){
			graphData.DataPoints.push(new DataPoint(key, temp[j].id, temp[j].taskNum, temp[j].started-base.started, temp[j].completed-base.started));
		}
	}
}
function buildRemindersData(){
	const data = Storage.data[selectedRoutine];
	const filtered = filterRoutineLeafs(data);
	const keys = Object.keys(filtered);
	graphData.maxX = keys.length;
	graphData.maxY = Math.max(...Object.keys(filtered).map(x => Math.max(...filtered[x].map(y => y.reminders))))
	
	for(let i=0;i<keys.length;i++){
		const key = keys[i];
		const temp = filtered[key];
		
		for(let j=0;j<temp.length;j++){
			graphData.DataPoints.push(new DataPoint(key, temp[j].id, temp[j].taskNum, temp[j].reminders, 0));
		}
	}
}
function buildData(){
	graphData.minX = 0;
	graphData.minY = 0;
	graphData.DataPoints = [];
	
	switch(graphType){
		case "flame":{
			buildFlameData();
			break;
		}
		case "waterfall":{
			buildWaterfallData();
			break;
		}
		case "pie":{
			buildPieData();
			break;
		}
		case "time":{
			buildTimeData();
			break;
		}
		case "reminders":{
			buildRemindersData();
			break;
		}
		default:{
			return;
		}
	}
}

function buildFlameTable(head, body, foot){
	const hr = document.createElement('tr');
	head.appendChild(hr);
	
	const name = document.createElement('th');
	name.textContent = "Task Name";
	hr.appendChild(name);			
	const start = document.createElement('th');
	start.textContent = "Start";
	hr.appendChild(start);
	const end = document.createElement('th');
	end.textContent = "End";
	hr.appendChild(end);
	const duration = document.createElement('th');
	duration.textContent = "Duration";
	hr.appendChild(duration);
	
	graphData.DataPoints.sort((a,b) => a.taskNum.localeCompare(b.taskNum));
	
	for(let i=0;i<graphData.DataPoints.length;i++){
		const datum = graphData.DataPoints[i];
		
		const tr = document.createElement('tr');
		body.appendChild(tr);
		
		const n = document.createElement('td');
		n.textContent = datum.task.text;
		tr.appendChild(n);			
		const s = document.createElement('td');
		s.textContent = formatTime(datum.x);
		tr.appendChild(s);
		const e = document.createElement('td');
		e.textContent = formatTime(datum.y);
		tr.appendChild(e);
		const d = document.createElement('td');
		d.textContent = formatTime(datum.y-datum.x, true);
		tr.appendChild(d);
	}
}
function buildWaterfallTable(head, body, foot){
	const hr = document.createElement('tr');
	head.appendChild(hr);
	
	const name = document.createElement('th');
	name.textContent = "Task Name";
	hr.appendChild(name);			
	const start = document.createElement('th');
	start.textContent = "Start";
	hr.appendChild(start);
	const end = document.createElement('th');
	end.textContent = "End";
	hr.appendChild(end);
	const duration = document.createElement('th');
	duration.textContent = "Duration";
	hr.appendChild(duration);
	
	graphData.DataPoints.sort((a,b) => a.taskNum.localeCompare(b.taskNum));
	
	for(let i=0;i<graphData.DataPoints.length;i++){
		const datum = graphData.DataPoints[i];
		
		const tr = document.createElement('tr');
		body.appendChild(tr);
		
		const n = document.createElement('td');
		n.textContent = datum.task.text;
		tr.appendChild(n);			
		const s = document.createElement('td');
		s.textContent = formatTime(datum.x);
		tr.appendChild(s);
		const e = document.createElement('td');
		e.textContent = formatTime(datum.y);
		tr.appendChild(e);
		const d = document.createElement('td');
		d.textContent = formatTime(datum.y-datum.x, true);
		tr.appendChild(d);
	}
}
function buildPieTable(head, body, foot){
	const hr = document.createElement('tr');
	head.appendChild(hr);
	
	const name = document.createElement('th');
	name.textContent = "Task Name";
	hr.appendChild(name);			
	const duration = document.createElement('th');
	duration.textContent = "Duration";
	hr.appendChild(duration);
	
	graphData.DataPoints.sort((a,b) => a.taskNum.localeCompare(b.taskNum));
	
	let totalDuration = 0;
	for(let i=0;i<graphData.DataPoints.length;i++){
		const datum = graphData.DataPoints[i];
		
		const tr = document.createElement('tr');
		body.appendChild(tr);
		
		const n = document.createElement('td');
		n.textContent = datum.task.text;
		tr.appendChild(n);			
		const d = document.createElement('td');
		d.textContent = formatTime(datum.y-datum.x, true);
		tr.appendChild(d);
		
		totalDuration += datum.y-datum.x
	}
	
	const fr = document.createElement('tr');
	foot.appendChild(fr);
	
	const total = document.createElement('th');
	total.textContent = "Total Task Time";
	fr.appendChild(total);			
	const sum = document.createElement('th');
	sum.textContent = formatTime(totalDuration, true);
	fr.appendChild(sum);
	
}
function buildTimeTable(head, body, foot){
	const hr = document.createElement('tr');
	head.appendChild(hr);
	
	const instance = document.createElement('th');
	instance.textContent = "Instance";
	hr.appendChild(instance);
	const name = document.createElement('th');
	name.textContent = "Task Name";
	hr.appendChild(name);			
	const value = document.createElement('th');
	value.textContent = "Duration";
	hr.appendChild(value);
	
	graphData.DataPoints.sort((a,b) => parseInt(b.instance)-parseInt(a.instance) || a.taskNum.localeCompare(b.taskNum));
	
	for(let i=0;i<graphData.DataPoints.length;i++){
		const datum = graphData.DataPoints[i];
		
		const tr = document.createElement('tr');
		body.appendChild(tr);

		const e = document.createElement('td');
		e.textContent = dateFormat(new Date(parseInt(datum.instance)));
		tr.appendChild(e);			
		const n = document.createElement('td');
		n.textContent = datum.task ? datum.task.text : datum.taskNum;
		tr.appendChild(n);			
		const d = document.createElement('td');
		d.textContent = formatTime(datum.y-datum.x, true);
		tr.appendChild(d);
	}
}
function buildRemindersTable(head, body, foot){
	const hr = document.createElement('tr');
	head.appendChild(hr);
	
	const instance = document.createElement('th');
	instance.textContent = "Instance";
	hr.appendChild(instance);
	const name = document.createElement('th');
	name.textContent = "Task Name";
	hr.appendChild(name);			
	const value = document.createElement('th');
	value.textContent = "Reminders";
	hr.appendChild(value);
	
	graphData.DataPoints.sort((a,b) => parseInt(b.instance)-parseInt(a.instance) || a.taskNum.localeCompare(b.taskNum));
	
	for(let i=0;i<graphData.DataPoints.length;i++){
		const datum = graphData.DataPoints[i];
		
		const tr = document.createElement('tr');
		body.appendChild(tr);

		const e = document.createElement('td');
		e.textContent = dateFormat(new Date(parseInt(datum.instance)));
		tr.appendChild(e);			
		const n = document.createElement('td');
		n.textContent = datum.task ? datum.task.text : datum.taskNum;
		tr.appendChild(n);			
		const r = document.createElement('td');
		r.textContent = datum.x;
		tr.appendChild(r);
	}
}
function buildTable(){
	const head = document.getElementById("tableHead");
	const body = document.getElementById("tableBody");
	const foot = document.getElementById("tableFoot");
	
	head.replaceChildren();
	body.replaceChildren();
	foot.replaceChildren();
	switch(graphType){
		case "flame":{
			buildFlameTable(head, body, foot);
			break;
		}
		case "waterfall":{
			buildWaterfallTable(head, body, foot);
			break;
		}
		case "pie":{
			buildPieTable(head, body, foot);
			break;
		}
		case "time":{
			buildTimeTable(head, body, foot);
			break;
		}
		case "reminders":{
			buildRemindersTable(head, body, foot);
			break;
		}
		default:{
			return;
		}
	}
}

function buildFlameGraph(){
	
}
function buildWaterfallGraph(){
	graphData.DataPoints.sort((a,b) => a.taskNum.localeCompare(b.taskNum));
	
	//write names and get longest name
	let longestName = 0;
	for(let i=0;i<graphData.DataPoints.length;i++){
		
	}
	
}
function buildPieGraph(){
	
}
function buildTimeGraph(){
	
}
function buildRemindersGraph(){
	
}

function buildGraph(){
	switch(graphType){
		case "flame":{
			buildFlameGraph();
			break;
		}
		case "waterfall":{
			buildWaterfallGraph();
			break;
		}
		case "pie":{
			buildPieGraph();
			break;
		}
		case "time":{
			buildTimeGraph();
			break;
		}
		case "reminders":{
			buildRemindersGraph();
			break;
		}
		default:{
			return;
		}
	}
}

function analyze(){
	const r = document.getElementById("Graph").getClientRects();
	w = r.width;
	h = r.height;
	
	buildData();
	buildTable();
	buildGraph();
	
	document.getElementById("graphData").classList.remove('hide');
}


//onresize do a thing.