"use strict";

//export table to csv button
//save image button

//graphs
//For a single Instance:
/*
	flame graph
	waterfall
	pie chart of leafs
*/
//Over time
/*
	x-day/y-task time
	x-day/y-task reminders
*/
const instanceGraphs = ['flame', 'waterfall', 'pie'];
const graphLeafs = ['pie', 'time', 'reminders'];

let graphObjects = [];
let graph = null;
let ctx = null;
let graphRoutineArea = null;
let graphInstanceArea = null;
let graphType = null;
let selectedRoutine = null;
let selectedInstance = null;
let w = 0;
let h = 0;
const twoPi = Math.PI*2;
const halfPi = Math.PI/2;
const rootThreeOverTwo = (3**.5)/2;
const graphData = new GraphData();
const graphColors = [
	'#FF0000','#00FF00','#0000FF','#FF00FF',
	'#FF8888','#88FF88','#8888FF','#FF88FF',
	'#FF0088','#00FF88','#0088FF','#FF00FF',
	'#FF8800','#88FF00','#8800FF',
	'#AA0000','#00AA00','#0000AA','#AA00AA','#AAAA00','#00AAAA'
];

function showGraphModal(){
	hideRightMenu();
	graphModal.classList.remove('hide');
}
function hideGraphModal(s){
	graphModal.classList.add('hide');
	document.getElementById('graphType').value = "Select Graph Type";
	
	graphType = null;
	selectedRoutine = null;
	selectedInstance = null;
	
	graphData.DataPoints = [];
	graphRoutineArea.classList.add('hide');
	graphInstanceArea.classList.add('hide');
	document.getElementById('generateGraph').classList.add('hide');
	document.getElementById("sideGraphData").classList.add('hide');
	document.getElementById("modalSideArea").classList.remove('hide');
	document.getElementById("graphOptionWrapper").classList.remove('hide');
	document.getElementById("bottomGraphData").classList.add('hide');
	document.getElementById('modalContentWrapper').classList.add('fullHeight');
	document.getElementById('modalContentWrapper').classList.remove('partialHeight');
	
	if(ctx){
		ctx.fillStyle = "#FFFFFF";
		ctx.beginPath();
		ctx.fillRect(0,0,w,h);
		ctx.stroke();
	}
}


function dateFormat(input){
	const M = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	return `${input.getDate().toString().padStart(2, '0')} ${M[input.getMonth()]} ${input.getFullYear()} - ${input.getHours().toString().padStart(2, '0')}:${input.getMinutes().toString().padStart(2, '0')}`;
}

function selectGraphType(value){
	graphType = value;
	selectedRoutine = null;
	selectedInstance = null;
	document.getElementById('generateGraph').classList.add('hide');
	document.getElementById("sideGraphData").classList.add('hide');
	document.getElementById('modalContentWrapper').classList.toggle('fullHeight', true);
	document.getElementById('modalContentWrapper').classList.toggle('partialHeight', false);
	
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
	
	this.xScale = 0;
	this.yScale = 0;
	this.xAxis = 0;
	this.yAxis = 0;
	
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
	name.classList.add('textCell');
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
		n.classList.add('textCell');
		tr.appendChild(n);			
		const s = document.createElement('td');
		s.textContent = formatTime(datum.x);
		s.classList.add('dataCell');
		tr.appendChild(s);
		const e = document.createElement('td');
		e.textContent = formatTime(datum.y);
		e.classList.add('dataCell');
		tr.appendChild(e);
		const d = document.createElement('td');
		d.textContent = formatTime(datum.y-datum.x, true);
		d.classList.add('dataCell');
		tr.appendChild(d);
	}
}
function buildWaterfallTable(head, body, foot){
	const hr = document.createElement('tr');
	head.appendChild(hr);
	
	const name = document.createElement('th');
	name.textContent = "Task Name";
	name.classList.add('textCell');
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
		n.classList.add('textCell');
		tr.appendChild(n);			
		const s = document.createElement('td');
		s.textContent = formatTime(datum.x);
		s.classList.add('dataCell');
		tr.appendChild(s);
		const e = document.createElement('td');
		e.textContent = formatTime(datum.y);
		e.classList.add('dataCell');
		tr.appendChild(e);
		const d = document.createElement('td');
		d.textContent = formatTime(datum.y-datum.x, true);
		d.classList.add('dataCell');
		tr.appendChild(d);
	}
}
function buildPieTable(head, body, foot){
	const hr = document.createElement('tr');
	head.appendChild(hr);
	
	const name = document.createElement('th');
	name.textContent = "Task Name";
	name.classList.add('textCell');
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
		n.classList.add('textCell');
		tr.appendChild(n);			
		const d = document.createElement('td');
		d.textContent = formatTime(datum.y-datum.x, true);
		d.classList.add('dataCell');
		tr.appendChild(d);
		
		totalDuration += datum.y-datum.x
	}
	
	const fr = document.createElement('tr');
	foot.appendChild(fr);
	
	const total = document.createElement('th');
	total.textContent = "Total Routine Time";
	total.classList.add('textCell');
	fr.appendChild(total);			
	const sum = document.createElement('th');
	sum.textContent = formatTime(totalDuration, true);
	sum.classList.add('dataCell');
	fr.appendChild(sum);
	
}
function buildTimeTable(head, body, foot){
	const hr = document.createElement('tr');
	head.appendChild(hr);

	const cols = [...new Set(graphData.DataPoints.map(x => x.instance))];
	const rows = [...new Set(graphData.DataPoints.map(x => x.taskNum))];
	
	const name = document.createElement('th');
	name.textContent = "Task Name";
	name.classList.add('textCell');
	hr.appendChild(name);
	
	for(let i=0;i<cols.length;i++){
		const temp = document.createElement('th');
		temp.textContent = dateFormat(new Date(parseInt(cols[i])));
		temp.classList.add('textCell');
		hr.appendChild(temp);
	}
	
	graphData.DataPoints.sort((a,b) => parseInt(b.instance)-parseInt(a.instance) || a.taskNum.localeCompare(b.taskNum));
	
	for(let i=0;i<rows.length;i++){
		const tr = document.createElement('tr');
		body.appendChild(tr);

		const n = document.createElement('td');
		const temp = graphData.DataPoints.find(x => x.taskNum === rows[i]);
		n.textContent = temp.task?temp.task.text : temp.taskNum;
		n.classList.add('textCell');
		tr.appendChild(n);			

		for(let j=0;j<cols.length;j++){
			const datum = graphData.DataPoints.find(x => x.instance === cols[j] && x.taskNum === rows[i]);

			const d = document.createElement('td');
			d.textContent = formatTime(datum.y-datum.x, true);
			d.classList.add('dataCell');
			tr.appendChild(d);
		}
	}
}
function buildRemindersTable(head, body, foot){
	const hr = document.createElement('tr');
	head.appendChild(hr);

	const cols = [...new Set(graphData.DataPoints.map(x => x.instance))];
	const rows = [...new Set(graphData.DataPoints.map(x => x.taskNum))];
	
	const name = document.createElement('th');
	name.textContent = "Task Name";
	name.classList.add('textCell');
	hr.appendChild(name);
	
	for(let i=0;i<cols.length;i++){
		const temp = document.createElement('th');
		temp.textContent = dateFormat(new Date(parseInt(cols[i])));
		temp.classList.add('textCell');
		hr.appendChild(temp);
	}
	
	graphData.DataPoints.sort((a,b) => parseInt(b.instance)-parseInt(a.instance) || a.taskNum.localeCompare(b.taskNum));
	
	for(let i=0;i<rows.length;i++){
		const tr = document.createElement('tr');
		body.appendChild(tr);

		const n = document.createElement('td');
		const temp = graphData.DataPoints.find(x => x.taskNum === rows[i]);
		n.textContent = temp.task?temp.task.text : temp.taskNum;
		n.classList.add('textCell');
		tr.appendChild(n);			

		for(let j=0;j<cols.length;j++){
			const datum = graphData.DataPoints.find(x => x.instance === cols[j] && x.taskNum === rows[i]);
			const d = document.createElement('td');
			d.textContent = datum.x;
			d.classList.add('dataCell');
			tr.appendChild(d);
		}
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

function graphObject(x, y, w, h, r, s, e, data){
	this.x = x;
	this.y = y;
	//for rect/point
	this.w = w;
	this.h = h;
	//for pie
	this.r = r;
	this.s = s;
	this.e = e;
	
	this.data = data;
}
graphObject.prototype.checkHit = function(x,y){
	if(this.x && this.y && this.w && this.h){
		const deltaX = x-this.x;
		const deltaY = y-this.y;

		return  this.x < x && deltaX < this.w && this.y < y && deltaY < this.h;
	}
	if(this.x && this.y && this.r && this.s && this.e){
		x -= this.x;
		y -= this.y;
		
		if(x**2 + y**2 > this.r**2){return false;}
		
		let rad = Math.atan2(y,x);
		while(rad < 0){rad += twoPi;}
		
		return this.s < rad && rad < this.e;
	}
	return false;
}
function graphClick(e){
	const rect = e.srcElement.getBoundingClientRect();
	let obj = graphObjects.find(x => x.checkHit(e.x - rect.x, e.y - rect.y));
	if(obj){
		//what to do here?
		console.log(obj);
		console.log(obj.data.task.text);
	}
}

function buildXY(){
	let stepScale = 5;
	if(graphType === 'time'){
		const timeScaleGroups = [200,1000,10*1000,30*1000,60*1000,5*60*1000];
		let i=0;
		while(timeScaleGroups[i]<graphData.maxY && i<timeScaleGroups.length-1){i++;}
		stepScale = timeScaleGroups[i];
	}
	const yStep = Math.max(1,Math.ceil((graphData.maxY-graphData.minY)/stepScale));
	graphData.maxY = graphData.minY + (yStep * stepScale);
	
	const xMargin = w * .01;
	const yMargin = h * .01;
	
	const taskNames = [...new Set(graphData.DataPoints.map(x => x.task?x.task.text:x.taskNum))];

	graphData.DataPoints.sort((a,b) => parseInt(b.instance)-parseInt(a.instance) || a.taskNum.localeCompare(b.taskNum));
	
	graphData.yAxis = 75;
	let xLabel = 0;
	ctx.font = "16px sans-serif";
	ctx.fillStyle = "#000000";
	for(let i=0;i<taskNames.length;i++){
		const text = taskNames[i];
		const size = ctx.measureText(text).width;
		xLabel = Math.max(size, xLabel);
	}
	
	graphData.xScale = (w - graphData.yAxis)/(graphData.maxX - graphData.minX) * .98;
	graphData.yScale = (h - xLabel)/(graphData.maxY - graphData.minY) * .98;

	//xAxis
	const xStep = (w - graphData.yAxis - xMargin - xMargin) / (taskNames.length);
	const rot = Math.PI/8;
	const cos = Math.cos(rot);
	const sin = Math.sin(rot);
	xLabel *= sin;
	graphData.xAxis = h - xLabel - yMargin - yMargin - (20 * sin);

	const labelPos = {};
	for(let i=0;i<taskNames.length;i++){
		const text = taskNames[i];
		const size = ctx.measureText(text).width;
		ctx.save();
		const x = xStep*(i+.5) + graphData.yAxis - (size*cos);
		const y = h - xLabel - yMargin + (size*sin);
		ctx.translate(x, y);
		ctx.rotate(-rot);
		ctx.fillText(text, 0,0);
		ctx.restore();
		
		labelPos[text] = xStep*(i+.5) + graphData.yAxis;
		ctx.beginPath();
		ctx.moveTo(xStep*(i+.5) + graphData.yAxis, graphData.xAxis-5);
		ctx.lineTo(xStep*(i+.5) + graphData.yAxis, graphData.xAxis);
		ctx.stroke();
		ctx.closePath();
	}
	
	ctx.beginPath();
	ctx.moveTo(graphData.yAxis, graphData.xAxis);
	ctx.lineTo(w, graphData.xAxis);
	ctx.stroke();
	
	ctx.beginPath();
	ctx.moveTo(graphData.yAxis, 0);
	ctx.lineTo(graphData.yAxis, graphData.xAxis);
	ctx.stroke();

	//yAxis
	const ySpace = (graphData.xAxis - yMargin) / 5;
	for(let i=0;i<=5;i++){
		const text = graphType === 'time' ? formatTime(yStep*i*(stepScale/5)) : (yStep*i).toString();
		const size = ctx.measureText(text).width;
		const x = graphData.yAxis - size - 5;
		const y = graphData.xAxis - ySpace*i;
		ctx.fillText(text, x, y+8);
		
		ctx.beginPath();
		ctx.moveTo(graphData.yAxis,y);
		ctx.lineTo(graphData.yAxis+5,y);
		ctx.stroke();
		ctx.closePath();
	}

	return labelPos;
}

function buildFlameGraph(){
	const xMargin = w * .01;
	const yMargin = h * .01;
	
	graphData.xScale = w/(graphData.maxX - graphData.minX) * .98;
	graphData.yScale = h/(graphData.maxY - graphData.minY) * .98;
	
	for(let i=0;i<graphData.DataPoints.length;i++){
		const datum = graphData.DataPoints[i];
		const x1 = (datum.x * graphData.xScale) + xMargin;
		const x2 = (datum.y - datum.x) * graphData.xScale;
		const depth = datum.taskNum.split('.').length-1;
		const y1 = (graphData.yScale * depth) + yMargin;
		const y2 = graphData.yScale;
		
		ctx.fillStyle = graphColors[depth % graphColors.length];
		ctx.strokeStyle = "#000000";
		ctx.lineWidth = 2;
		
		ctx.beginPath();
		ctx.fillRect(x1, y1, x2, y2);
		ctx.rect(x1, y1, x2, y2);
		graphObjects.push(new graphObject(x1, y1, x2, y2, null, null, null, datum));
		ctx.closePath();
		ctx.stroke();
		
		ctx.font = "16px sans-serif";
		ctx.fillStyle = "#000000";
		const text = datum.task?datum.task.text:datum.taskNum;
		const size = ctx.measureText(text);

		const tx = x1 + 20;
		const ty = y1 + size.width + 5;

		ctx.save();
		ctx.translate(tx,ty);
		ctx.rotate(-Math.PI/2);
		ctx.fillText(text, 0,0);
		ctx.restore();
	}
}
function buildWaterfallGraph(){
	
	const xMargin = w * .01;
	const yMargin = h * .01;
	
	graphData.yScale = h/(graphData.maxY - graphData.minY) * .98;

	//write names and get longest name
	graphData.DataPoints.sort((a,b) => a.taskNum.localeCompare(b.taskNum));
	let longestName = 0;
	for(let i=0;i<graphData.DataPoints.length;i++){
		const datum = graphData.DataPoints[i];

		ctx.font = (graphData.yScale/2) +"px sans-serif";
		ctx.fillStyle = "#000000";
		const text = datum.task?datum.task.text:datum.taskNum;
		const size = ctx.measureText(text);
		longestName = Math.max(longestName, size.width);
		
		const tx = xMargin;
		const ty = graphData.yScale * (i + .5) + yMargin;
		ctx.fillText(text, tx, ty);
	}
	
	ctx.beginPath();
	ctx.lineWidth = 2;
	ctx.strokeStyle = "#000000";
	ctx.moveTo(xMargin + longestName + xMargin, 0);
	ctx.lineTo(xMargin + longestName + xMargin, h);
	ctx.stroke();
	ctx.closePath();
	
	graphData.xScale = (w-longestName)/(graphData.maxX - graphData.minX) * .94;
	
	const xPad = longestName + (3*xMargin);
	for(let i=0;i<graphData.DataPoints.length;i++){
		const datum = graphData.DataPoints[i];
		
		const x1 = (datum.x * graphData.xScale) + xPad;
		const x2 = (datum.y - datum.x) * graphData.xScale;
		const y1 = (yScale * i) + yMargin;
		const y2 = yScale;
		
		ctx.fillStyle = graphColors[i % graphColors.length];
		ctx.strokeStyle = "#000000";
		ctx.lineWidth = 2;
		
		ctx.beginPath();
		ctx.fillRect(x1, y1, x2, y2);
		ctx.rect(x1, y1, x2, y2);
		graphObjects.push(new graphObject(x1, y1, x2, y2, null, null, null, datum));
		ctx.closePath();
		ctx.stroke();
	}
	
}
function buildPieGraph(){
	const center = {x:w/2,y:h/2};
	const r = Math.min(w,h)/2.2;
	const totalTime = graphData.DataPoints.reduce((n, {x,y}) => n + (y-x), 0);
	
	ctx.save();
	ctx.translate(center.x,center.y);

	let start = 0;
	for(let i=0;i<graphData.DataPoints.length;i++){
		const datum = graphData.DataPoints[i];
		const duration = twoPi * (datum.y-datum.x)/totalTime;
		const end = start + duration;

		ctx.fillStyle = graphColors[i % graphColors.length];
		ctx.strokeStyle = "#000000";
		ctx.lineWidth = 2;

		ctx.beginPath();
		ctx.moveTo(0, 0);
		ctx.arc(0, 0, r, 0, duration);
		graphObjects.push(new graphObject(center.x, center.y, null, null, r, start, end, datum));
		ctx.closePath();
		ctx.stroke();
		ctx.fill();
		
		ctx.font = "16px sans-serif";
		const text = datum.task?datum.task.text:datum.taskNum;
		const size = ctx.measureText(text);
		const tx = r-size.width-10;
		const ty = 0;

		ctx.rotate(duration/2);
		const textAngle = start + duration/2;
		ctx.translate(tx,ty);
		if(textAngle >= halfPi && textAngle <= 3*halfPi){
			ctx.rotate(Math.PI);
			ctx.translate(-size.width,0);
		}
		ctx.beginPath();
		ctx.fillStyle = "#000000";
		ctx.fillText(text, 0, 0);
		ctx.closePath();
		if(textAngle >= halfPi && textAngle <= 3*halfPi){
			ctx.translate(size.width,0);
			ctx.rotate(-Math.PI);
		}
		ctx.translate(-tx,-ty);
		
		ctx.rotate(duration/2);
		start = end;
	}
	
	ctx.restore();
}
function buildTimeGraph(){
	const labelPos = buildXY();
	
	const series = [...new Set(graphData.DataPoints.map(x => x.instance))];
	const taskNums = [...new Set(graphData.DataPoints.map(x => x.taskNum))].sort();

	for(let i=0;i<series.length;i++){
		//get color
		ctx.fillStyle = graphColors[i % graphColors.length];
		ctx.strokeStyle = graphColors[i % graphColors.length];
		ctx.lineWidth = 2;
		
		//start path		
		const first = graphData.DataPoints.find(x => x.instance === series[i] && x.taskNum === taskNums[0]);
		ctx.beginPath();
		const tempX = labelPos[first.task?first.task.text:first.taskNum];
		const tempY = graphData.xAxis-((first.y-first.x)*graphData.yScale);
		graphObjects.push(new graphObject(tempX, tempY, null, null, 4, 0, twoPi, first));
		ctx.arc(tempX, tempY, 4,0,twoPi);
		
		ctx.fill();
		ctx.closePath();

	for(let j=1;j<taskNums.length;j++){
			const prev = graphData.DataPoints.find(x => x.instance === series[i] && x.taskNum === taskNums[j-1]);
			const datum = graphData.DataPoints.find(x => x.instance === series[i] && x.taskNum === taskNums[j]);

			const x = labelPos[datum.task?datum.task.text:datum.taskNum];
			const y = graphData.xAxis-((datum.y-datum.x)*graphData.yScale);
			graphObjects.push(new graphObject(x, y, null, null, 4, 0, twoPi, datum));

			ctx.beginPath();
			ctx.arc(x, y, 4,0,twoPi);
			ctx.fill();
			ctx.closePath();
			
			ctx.beginPath();
			ctx.moveTo(labelPos[prev.task?prev.task.text:prev.taskNum], graphData.xAxis-((prev.y-prev.x)*graphData.yScale));
			ctx.lineTo(x, y);
			ctx.stroke();
			ctx.closePath();
		}
		ctx.closePath();
	}

}
function buildRemindersGraph(){
	const labelPos = buildXY();
	
	const series = [...new Set(graphData.DataPoints.map(x => x.instance))];
	const taskNums = [...new Set(graphData.DataPoints.map(x => x.taskNum))].sort();

	for(let i=0;i<series.length;i++){
		//get color
		ctx.fillStyle = graphColors[i % graphColors.length];
		ctx.strokeStyle = graphColors[i % graphColors.length];
		ctx.lineWidth = 2;

		//start path		
		const first = graphData.DataPoints.find(x => x.instance === series[i] && x.taskNum === taskNums[0]);
		ctx.beginPath();
		const tempX = labelPos[first.task?first.task.text:first.taskNum];
		const tempY = graphData.xAxis-(first.x*graphData.yScale);
		graphObjects.push(new graphObject(tempX, tempY, null, null, 4, 0, twoPi, first));
		ctx.arc(tempX, tempY, 4,0,twoPi);
		
		ctx.fill();
		ctx.closePath();
		
		for(let j=1;j<taskNums.length;j++){
			const prev = graphData.DataPoints.find(x => x.instance === series[i] && x.taskNum === taskNums[j-1]);
			const datum = graphData.DataPoints.find(x => x.instance === series[i] && x.taskNum === taskNums[j]);

			const x = labelPos[datum.task?datum.task.text:datum.taskNum];
			const y = graphData.xAxis-(datum.x*graphData.yScale);
			graphObjects.push(new graphObject(x, y, null, null, 4, 0, twoPi, datum));

			ctx.beginPath();
			ctx.arc(x, y, 4,0,twoPi);
			ctx.fill();
			ctx.closePath();
			
			ctx.beginPath();
			ctx.moveTo(labelPos[prev.task?prev.task.text:prev.taskNum], graphData.xAxis-(prev.x*graphData.yScale));
			ctx.lineTo(x, y);
			ctx.stroke();
			ctx.closePath();
		}
		ctx.closePath();
	}
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
	const isInstance = instanceGraphs.includes(graphType);
	document.getElementById('sideGraphData').classList.toggle('hide', !isInstance);
	document.getElementById('bottomGraphData').classList.toggle('hide', isInstance);

	document.getElementById('modalSideArea').classList.toggle('hide', !isInstance);
	
	document.getElementById('modalContentWrapper').classList.toggle('fullHeight', isInstance);
	document.getElementById('modalContentWrapper').classList.toggle('partialHeight', !isInstance);
	
	const dataWrapperParent = isInstance ? document.getElementById('sideGraphData') : document.getElementById('bottomGraphData');
	dataWrapperParent.appendChild(document.getElementById('graphDataTable'));

	document.getElementById('graphOptionWrapper').classList.add('hide');
	
	graph = document.getElementById("Graph");
	const r = graph.getBoundingClientRect();
	w = r.width;
	h = r.height;

	graphObjects = [];
	graph.width = w;
	graph.height = h;
	graph.onmousedown = graphClick;

	ctx = graph.getContext('2d');
	
	buildData();
	buildTable();
	buildGraph();
}

//redo build non-instance tables to have instances be the column headers?
//onresize do a thing.