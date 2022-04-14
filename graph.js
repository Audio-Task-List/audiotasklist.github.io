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

function DataPoint(taskID, taskNum, x, y){
	this.task = tasks.find(x => x.id === taskID);
	this.taskNum = taskNum;
	this.x = x;
	this.y = y;
}

function buildData(input){
	const base = input.find(x => x.id===-1);
	if(!base){return;}
	graphData.minX = 0;
	graphData.maxX = base.completed - base.started;
	
	graphData.minY = 0;
	switch(graphType){
		case "flame":{
			const r = routines.find(x => x.id === selectedRoutine);
			graphData.maxY = tasksMaxDepth(r.tasks);
			break;
		}
		case "waterfall":{
			graphData.maxY = input.length - 1;
			break;
		}
		case "pie":{
			graphData.maxY = 0;
			break;
		}
		case "time":{
			graphData.maxY = Math.max(...input.map(x => x.completed-x.started));
			break;
		}
		case "reminders":{
			graphData.maxY = Math.max(...input.map(x => x.reminders));
			break;
		}
		default:{
			return;
		}
	}

	graphData.DataPoints = [];
	for(let i=0;i<input.length;i++){
		if(input[i].id === -1){continue;}
		
		switch(graphType){
		case "flame":
		case "waterfall":{
			graphData.DataPoints.push(new DataPoint(input[i].id, input[i].taskNum, input[i].started-base.started, input[i].completed-base.started));
			break;
		}
		case "pie":{
			//TODO: get the leaf times.
		}
		case "time":{
			//graphData.DataPoints.push(new DataPoint(input[i].id, ,input[i].completed-input[i].started);
			break;
		}
		case "reminders":{
			//graphData.DataPoints.push(new DataPoint(input[i].id, ,input[i].reminders);
			break;
		}
		default:{
			return;
		}
	}
	}
}
function buildTable(){
	const head = document.getElementById("tableHead");
	const body = document.getElementById("tableBody");

	switch(graphType){
		case "flame":{
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
			
			for(let i=0;i<graphData.DataPoints.length;i++){
				const tr = document.createElement('tr');
				body.appendChild(tr);
				
				
				const n = document.createElement('td');
				n.textContent = graphData.DataPoints[i].task.text;
				tr.appendChild(n);			
				const s = document.createElement('td');
				s.textContent = formatTime(graphData.DataPoints[i].x);
				tr.appendChild(s);
				const e = document.createElement('td');
				e.textContent = formatTime(graphData.DataPoints[i].y);
				tr.appendChild(e);
			}

			break;
		}
		case "waterfall":{
			break;
		}
		case "pie":{
			break;
		}
		case "time":{
			break;
		}
		case "reminders":{
			break;
		}
		default:{
			return;
		}
	}
}

function flame(){
	
}
function waterfall(){
	graphData.DataPoints.sort((a,b) => a.taskNum.localeCompare(b.taskNum));
	
	//write names and get longest name
	let longestName = 0;
	for(let i=0;i<graphData.DataPoints.length;i++){
		
	}
	
}
function pie(){
	
}
function time(){
	
}
function reminders(){
	
}


function buildGraph(){
	const r = document.getElementById("Graph").getClientRects();
	w = r.width;
	h = r.height;

	const instance = instanceGraphs.includes(graphType);
	const data = instance ? Storage.data[selectedRoutine][selectedInstance] : Storage.data[selectedRoutine];;
	buildData(data);
	buildTable(instance);

	switch(graphType){
		case "flame":{
			flame();
			break;
		}
		case "waterfall":{
			waterfall();
			break;
		}
		case "pie":{
			pie();
			break;
		}
		case "time":{
			time();
			break;
		}
		case "reminders":{
			reminders();
			break;
		}
		default:{
			return;
		}
	}
	
	document.getElementById("graphData").classList.remove('hide');
}
