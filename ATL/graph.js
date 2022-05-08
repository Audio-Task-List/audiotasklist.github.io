"use strict";
//BUG: fix non-instance graphs when multiple tasks have the same text.

const instanceGraphs = ['flame', 'waterfall', 'pie'];
const twoPi = Math.PI*2;
const halfPi = Math.PI/2;
const rootThreeOverTwo = (3**.5)/2;

let instanceGroups = {};
let graphObjects = [];
let graph = null;
let ctx = null;
let graphType = null;
let selectedRoutine = null;
let selectedInstance = null;
let currentObject = null;
let clickedObject = null;

let w = 0;
let h = 0;

const graphData = new GraphData();
const graphColors = [
	'#FF0000','#00FF00','#0000FF','#FF00FF',
	'#FF8888','#88FF88','#8888FF','#FF88FF',
	'#FF0088','#00FF88','#0088FF','#FF00FF',
	'#FF8800','#88FF00','#8800FF',
	'#AA0000','#00AA00','#0000AA','#AA00AA','#AAAA00','#00AAAA'
];

function resetGraphOptions(){
	document.getElementById('graphType').value = "Select Graph Type";
	graphType = null;
	selectedRoutine = null;
	selectedInstance = null;
	
	graphData.DataPoints = [];
	document.getElementById('graphRoutine').classList.add('hide');
	document.getElementById('graphInstance').classList.add('hide');
	document.getElementById('graphTotal').classList.add('hide');
	document.getElementById('generateGraph').classList.add('hide');
	document.getElementById("sideGraphData").classList.add('hide');
	document.getElementById("bottomGraphData").classList.add('hide');
	document.getElementById('resetGraph').classList.add('hide');
	document.getElementById('saveGraphButtons').classList.add('hide');
	
	document.getElementById("modalSideArea").classList.remove('hide');
	document.getElementById("graphOptionWrapper").classList.remove('hide');

	document.getElementById('modalContentWrapper').classList.add('fullHeight');
	document.getElementById('modalContentWrapper').classList.remove('partialHeight');
	document.getElementById('modalSideArea').style.removeProperty('min-width');
	
	clickedObject = null;
	currentObject = null;
	
	if(ctx){
		ctx.fillStyle = "#FFFFFF";
		ctx.beginPath();
		ctx.fillRect(0,0,w,h);
		ctx.stroke();
	}
}

function showGraphModal(){
	if(!graph){graph = document.getElementById("Graph");}
	hideRightMenu();
	graphModal.classList.remove('hide');
}
function hideGraphModal(s){
	resetGraphOptions();
	graphModal.classList.add('hide');
}

function getSelectText(id){
	const e = document.getElementById(id);
	return e.options[e.selectedIndex].text;
}
function saveGraphImage(){
    const graphImage = graph.toDataURL('image/png');
	const routineName = getSelectText('selectGraphRoutine');
	const instanceName = selectedInstance?dateFormat(new Date(parseInt(selectedInstance))):dateFormat();
	const name = `ATL_graph_${graphType}_${routineName}_${instanceName}.png`;

    const dlImage = graphImage.replace("image/png", "image/octet-stream");
	
	const dl = document.createElement('a');
    document.body.appendChild(dl);
	
	dl.setAttribute("href", dlImage);
    dl.target = '_self';
    dl.download = name;

    document.body.appendChild(dl);
	dl.click(); 
    document.body.removeChild(dl);
}
function saveGraphTable(){
    // Adapted from https://stackoverflow.com/a/56370447/425493
    const rows = document.querySelectorAll('table#graphDataTable tr');
    const csv = [];
    for (let i = 0; i < rows.length; i++) {
        const row = [], cols = rows[i].querySelectorAll('td, th');
        for (let j = 0; j < cols.length; j++) {
            const data = cols[j].innerText.replace(/(\r\n|\n|\r)/gm, '').replace(/(\s\s)/gm, ' ').replace(/"/g, '""');
            row.push('"' + data + '"');
        }
        csv.push(row.join(','));
    }
    const csv_string = csv.join('\n');

	const routineName = getSelectText('selectGraphRoutine');
	const instanceName = selectedInstance?dateFormat(new Date(parseInt(selectedInstance))):dateFormat();
	const name = `ATL_table_${graphType}_${routineName}_${instanceName}.csv`;

	const dl = document.createElement('a');

	dl.target = '_self';
    dl.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv_string));
    dl.setAttribute('download', name);

	document.body.appendChild(dl);
    dl.click();
    document.body.removeChild(dl);
}

function selectGraphType(value){
	graphType = value;
	selectedRoutine = null;
	selectedInstance = null;
	document.getElementById('generateGraph').classList.add('hide');
	document.getElementById("sideGraphData").classList.add('hide');
	document.getElementById("graphInstance").classList.add('hide');
	document.getElementById('graphTotal').classList.add('hide');
	document.getElementById('modalContentWrapper').classList.add('fullHeight');
	document.getElementById('modalContentWrapper').classList.remove('partialHeight');
	document.getElementById("graphRoutine").classList.remove('hide');

	//populate routines
	const ddl = document.getElementById('selectGraphRoutine');
	clearChildNodes('selectGraphRoutine');
	
	const o = document.createElement('option');
	o.setAttribute('selected', null);
	o.setAttribute('disabled', null);
	o.setAttribute('hidden', null);
	o.textContent = "Select Routine";
	ddl.appendChild(o);
	
	const keys = Object.keys(Storage.data).map(x => parseInt(x));
	for(let i=0;i<availableRoutines.length;i++){
		const r = availableRoutines[i];
		if(r.id === -1 || !keys.includes(r.id)){continue;}
		
		const o = document.createElement('option');
		o.setAttribute('value', r.id);
		o.textContent = r.name;
		ddl.appendChild(o);
	}
	
}
function onSelectGraphRoutine(value){
	selectedRoutine = parseInt(value);
	selectedInstance = null;
	
	const instanceGraph = instanceGraphs.includes(graphType);
	document.getElementById('generateGraph').classList.toggle('hide', instanceGraph);
	document.getElementById("graphInstance").classList.toggle('hide', !instanceGraph);
	document.getElementById('graphTotal').classList.toggle('hide', instanceGraph);
	
	const instanceKeys = Object.keys(Storage.data[selectedRoutine]).map(x => parseInt(x));
	
	if(!instanceGraph){ 
		//set dateFrom to new Date - 7 days
		const min = Math.min(...instanceKeys);
		document.getElementById('dateFrom').valueAsDate = new Date(min);
		document.getElementById('dateTo').valueAsDate = new Date();
		return; 
	}
	
	const ddl = document.getElementById('ddlYearMonth');
	clearChildNodes('ddlYearMonth');
	
	const o = document.createElement('option');
	o.setAttribute('selected', null);
	o.setAttribute('disabled', null);
	o.setAttribute('hidden', null);
	o.textContent = "Select Year-Month";
	ddl.appendChild(o);
	
	instanceGroups = {};
	
	for(let i=0;i<instanceKeys.length;i++){
		const iKey = instanceKeys[i];
		const date = new Date(iKey);
		const yearMonth = `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, '0')}`;
		
		if(!instanceGroups[yearMonth]){
			instanceGroups[yearMonth] = [];
			
			const o = document.createElement('option');
			o.setAttribute('value', yearMonth);
			o.textContent = yearMonth;
			ddl.appendChild(o);
		}
		instanceGroups[yearMonth].push(iKey);
	}
	
	document.getElementById('graphInstance').classList.remove('hide');
	document.getElementById('selectGraphInstance').classList.add('hide');
}
function getMonthInstances(sender){
	//populate instances of routine
	const ddl = document.getElementById('ddlGraphInstance');
	clearChildNodes('ddlGraphInstance');
	
	const o = document.createElement('option');
	o.setAttribute('selected', null);
	o.setAttribute('disabled', null);
	o.setAttribute('hidden', null);
	o.textContent = "Select Instance";
	ddl.appendChild(o);
	
	const keys = instanceGroups[sender.value];
	for(let i=0;i<keys.length;i++){
		const key = keys[i];
		const d = new Date(parseInt(key, 10));
		
		const o = document.createElement('option');
		o.setAttribute('value', key);
		o.textContent = dateFormat(d);
		ddl.appendChild(o);
	}
	
	document.getElementById('selectGraphInstance').classList.remove('hide');
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
	this.xStep = 0;
	
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

function filterData(input){
	const from = document.getElementById('dateFrom').valueAsDate;
	const to = document.getElementById('dateTo').valueAsDate;
	const output = {};
	
	for(let [key,value] of Object.entries(input)){
		const date = new Date(parseInt(key));
		if(date>from && date<to){
			output[key]=value;
		}
	}
	
	return output;
}
function buildFlameData(){
	const data = Storage.data[selectedRoutine][selectedInstance];
	const base = data.find(x => x.id===-1);
	if(!base){return;}
	const r = routines.find(x => x.id === selectedRoutine);
	
	graphData.maxX = base.completed;
	graphData.maxY = tasksMaxDepth(r.tasks);
	
	for(let i=0;i<data.length;i++){
		if(data[i].id === -1){continue;}
		graphData.DataPoints.push(new DataPoint(null, data[i].id, data[i].taskNum, data[i].started, data[i].completed));
	}
}
function buildWaterfallData(){
	const data = Storage.data[selectedRoutine][selectedInstance];

	const base = data.find(x => x.id===-1);
	if(!base){return;}
	
	graphData.maxX = base.completed;
	graphData.maxY = data.length - 1;
	
	for(let i=0;i<data.length;i++){
		if(data[i].id === -1){continue;}
		graphData.DataPoints.push(new DataPoint(null, data[i].id, data[i].taskNum, data[i].started, data[i].completed));
	}
}
function buildPieData(){
	const data = Storage.data[selectedRoutine][selectedInstance];

	graphData.maxY = 0;
	
	let sum = 0;
	const filtered = filterLeaf(data);
	for(let i=0;i<filtered.length;i++){
		if(filtered[i].id === -1){continue;}
		graphData.DataPoints.push(new DataPoint(null, filtered[i].id, filtered[i].taskNum, filtered[i].started, filtered[i].completed));
		sum += filtered[i].completed-filtered[i].started;
	}
	graphData.maxX = sum;
}
function buildTimeData(){
	const data = filterData(Storage.data[selectedRoutine]);
	const filtered = filterRoutineLeafs(data);
	const keys = Object.keys(filtered);
	graphData.maxX = keys.length;
	
	let maxY = 0;
	for(let i=0;i<keys.length;i++){
		const key = keys[i];
		const temp = filtered[key];
		
		for(let j=0;j<temp.length;j++){
			if(temp[j].id===-1){continue;}
			maxY = Math.max(maxY, temp[j].completed - temp[j].started);
			graphData.DataPoints.push(new DataPoint(key, temp[j].id, temp[j].taskNum, temp[j].started, temp[j].completed));
		}
	}
	graphData.maxY = maxY;
}
function buildRemindersData(){
	const data = filterData(Storage.data[selectedRoutine]);
	const filtered = filterRoutineLeafs(data);
	const keys = Object.keys(filtered);
	graphData.maxX = keys.length;
	
	let maxY = 0;
	for(let i=0;i<keys.length;i++){
		const key = keys[i];
		const temp = filtered[key];
		for(let j=0;j<temp.length;j++){
			if(temp[j].id===-1){continue;}
			maxY = Math.max(maxY, temp[j].reminders);
			graphData.DataPoints.push(new DataPoint(key, temp[j].id, temp[j].taskNum, temp[j].reminders, 0));
		}
	}
	graphData.maxY = maxY;

}
function buildStackedPercentData(){
	const data = filterData(Storage.data[selectedRoutine]);
	const filtered = filterRoutineLeafs(data);
	const keys = Object.keys(filtered);
	graphData.maxX = keys.length;
	graphData.maxY = 100;
	
	for(let i=0;i<keys.length;i++){
		const key = keys[i];
		const temp = filtered[key];
		const base = temp.find(x => x.id===-1);
		const total = temp.reduce((sum, x) => sum += x.id===-1?0:(x.completed-x.started),0);
		
		let sum = 0;
		for(let j=0;j<temp.length;j++){
			if(temp[j].id===-1){continue;}
			const percent = 100 * (temp[j].completed - temp[j].started) / total;
			graphData.DataPoints.push(new DataPoint(key, temp[j].id, temp[j].taskNum, sum, sum + percent));
			sum += percent;
		}
	}
}
function buildStackedTotalData(){
	const data = filterData(Storage.data[selectedRoutine]);
	const filtered = filterRoutineLeafs(data);
	const keys = Object.keys(filtered);
	graphData.maxX = keys.length;
	let maxY = 0;
	
	for(let i=0;i<keys.length;i++){
		const key = keys[i];
		const temp = filtered[key];
		const base = temp.find(x => x.id===-1);
		
		let sum = 0;
		for(let j=0;j<temp.length;j++){
			if(temp[j].id===-1){continue;}
			const duration = temp[j].completed - temp[j].started;
			graphData.DataPoints.push(new DataPoint(key, temp[j].id, temp[j].taskNum, sum, duration));
			sum += duration;
		}
		maxY = Math.max(sum, maxY);
	}
	
	graphData.maxY = maxY;
}
function buildStackedReminderData(){
	const data = filterData(Storage.data[selectedRoutine]);
	const filtered = filterRoutineLeafs(data);
	const keys = Object.keys(filtered);
	graphData.maxX = keys.length;
	let maxY = 0;
	
	for(let i=0;i<keys.length;i++){
		const key = keys[i];
		const temp = filtered[key];
		const base = temp.find(x => x.id===-1);
		
		let sum = 0;
		for(let j=0;j<temp.length;j++){
			if(temp[j].id===-1){continue;}
			const reminders = temp[j].reminders;
			graphData.DataPoints.push(new DataPoint(key, temp[j].id, temp[j].taskNum, sum, reminders));
			sum += reminders;
		}
		maxY = Math.max(sum, maxY);
	}

	graphData.maxY = maxY;
}
function buildData(){
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
		case "stackedPercent":{
			buildStackedPercentData();
			break;
		}
		case "stackedTotal":{
			buildStackedTotalData();
			break;
		}
		case "stackedReminders":{
			buildStackedReminderData();
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
function buildStackedPercentTable(head, body, foot){
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
			const p = Math.floor(100 * (datum.y-datum.x))/100;
			datum.value = p+"%";
			const d = document.createElement('td');
			d.textContent = p+"%";
			d.classList.add('dataCell');
			tr.appendChild(d);
		}
	}
}
function buildStackedTotalTable(head, body, foot){
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
			d.textContent = formatTime(datum.y, true);
			d.classList.add('dataCell');
			tr.appendChild(d);
		}
	}	
}
function buildStackedReminderTable(head, body, foot){
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
			d.textContent = datum.y;
			d.classList.add('dataCell');
			tr.appendChild(d);
		}
	}	
}
function buildTable(){
	const head = document.getElementById("tableHead");
	const body = document.getElementById("tableBody");
	const foot = document.getElementById("tableFoot");
	
	clearChildNodes('tableHead');
	clearChildNodes('tableBody');
	clearChildNodes('tableFoot');
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
		case "stackedPercent":{
			buildStackedPercentTable(head, body, foot);
			break;
		}
		case "stackedTotal":{
			buildStackedTotalTable(head, body, foot);
			break;
		}
		case "stackedReminders":{
			buildStackedReminderTable(head, body, foot);
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
	if(this.x && this.y && this.r && this.s!==null && this.e!==null){//s & e could be 0
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
	clickedObject = currentObject;
	buildGraph();
}
function graphMouseMove(e){
	const rect = e.srcElement.getBoundingClientRect();
	const obj = graphObjects.find(x => x.checkHit(e.x - rect.x, e.y - rect.y));
	if(obj === currentObject){return;}
	
	currentObject = obj;
	graph.style.cursor = obj?'pointer':'default';
	buildGraph();
}
function drawClickedObject(){
	if(!clickedObject){return;}

	const dataH = Math.min(h/12,18);
	const midH = clickedObject.y+clickedObject.h/2;
	const midW = clickedObject.x+clickedObject.w/2;
	const pipSize = 15;
	let drawPip = true;

	let x = midW + pipSize;
	let y = midH - dataH*1.5;

	const instanceName = dateFormat(new Date(parseInt(selectedInstance||clickedObject.data.instance)));
	const text = clickedObject.data.task.text;
	let value = '';
	
	switch(graphType){
		case "flame":
		case "waterfall":
		{
			value = formatTime(clickedObject.data.y-clickedObject.data.x, true);
			break;
		}
		case "pie":{
			value = formatTime(clickedObject.data.y-clickedObject.data.x, true);
			drawPip = false;
			
			x = 5;
			y = 5;
			break;
		}
		case "stackedPercent":{
			value = clickedObject.data.value;
			break;
		}
		case "stackedTotal":{
			value = formatTime(clickedObject.data.y, true);
			break;
		}
		case "stackedReminders":{
			value = clickedObject.data.y;
			break;
		}
		case "reminders":
		case "time":
		{
			ctx.beginPath();
			ctx.fillStyle="#000000";
			ctx.font = getFont(dataH);
			ctx.fillText("Instance: " + instanceName, graphData.yAxis+3, dataH);
			ctx.closePath();
		
			const instanceData = graphObjects.filter(x => x.data.instance === clickedObject.data.instance);
			const height = h/40;
			const font = getFont(height);
			
			for(let i=0;i<instanceData.length;i++){
				const datum = instanceData[i];
				const text = graphType==="time"?
					formatTime(datum.data.y-datum.data.x, true)
					: datum.data.x;
					
				ctx.beginPath();
				ctx.strokeStyle="#000000";
				ctx.fillStyle="#FFFFFF";
				
				const size = Math.min(graphData.xStep,ctx.measureText(text).width);
				ctx.rect(datum.x+3,datum.y-height*1.5, size+4, height*2);
				ctx.fill();
				ctx.stroke();
				ctx.closePath();
				
				ctx.beginPath();
				ctx.fillStyle="#000000";
				ctx.fillText(text, datum.x+5,datum.y, size);
				ctx.closePath();
			}
			return;
		}
		default:{
			return;
		}
	}

	ctx.font = getFont(dataH);
	const width = Math.max(ctx.measureText(instanceName).width,ctx.measureText(text).width,ctx.measureText(value).width); 
	
	y = Math.max(2,y);
	let leftPip = true;
	if(x+width > w){
		x = midW - width - pipSize;
		leftPip = false;
	}

	ctx.beginPath();
	ctx.fillStyle="#FFFFFF";
	ctx.strokeStyle="#000000";
	ctx.rect(x, y, width+4,dataH*3+5);
	if(drawPip){
		if(leftPip){
			ctx.moveTo(x,midH);
			ctx.lineTo(x-pipSize,midH);
		}
		else{
			ctx.moveTo(x+width,midH);
			ctx.lineTo(x+width+pipSize,midH);
		}
	}
	ctx.stroke();
	ctx.fill();
	ctx.closePath();
	
	ctx.beginPath();
	ctx.fillStyle="#000000";
	ctx.font = getFont(dataH);
	ctx.fillText(instanceName, x+2,y+dataH);
	ctx.fillText(text, x+2,y+dataH*2);
	ctx.fillText(value, x+2,y+dataH*3);
	ctx.closePath();
}
function drawCurrentObject(){
	if(!currentObject){return;}
	switch(graphType){
		case "flame":
		case "waterfall":
		case "stackedPercent":
		case "stackedTotal":
		case "stackedReminders":
		{
			ctx.beginPath();
			ctx.strokeStyle = "#000000";
			ctx.lineWidth=4;
			ctx.rect(currentObject.x, currentObject.y, currentObject.w, currentObject.h);
			ctx.stroke();
			ctx.closePath();
			
			ctx.beginPath();
			ctx.strokeStyle = "#FFFFFF";
			ctx.lineWidth=2;
			ctx.rect(currentObject.x, currentObject.y, currentObject.w, currentObject.h);
			ctx.stroke();			
			ctx.closePath();
			break;
		}
		case "pie":{
			ctx.beginPath();
			ctx.lineWidth=4;
			ctx.strokeStyle="#000000";
			ctx.moveTo(w/2, h/2);
			ctx.arc(w/2, h/2, currentObject.r, currentObject.s, currentObject.e);
			ctx.lineTo(w/2,h/2);
			ctx.stroke();
			ctx.closePath();
			
			ctx.beginPath();
			ctx.lineWidth=2;
			ctx.strokeStyle="#FFFFFF";
			ctx.moveTo(w/2, h/2);
			ctx.arc(w/2, h/2, currentObject.r, currentObject.s, currentObject.e);
			ctx.lineTo(w/2,h/2);
			ctx.stroke();
			ctx.closePath();

			break;
		}
		case "reminders":
		case "time":
		{
			ctx.beginPath();
			ctx.fillStyle = "#000000";
			ctx.arc(currentObject.x, currentObject.y, currentObject.r*2, currentObject.s, currentObject.e);
			ctx.fill();
			ctx.closePath();
			
			ctx.beginPath();
			ctx.strokeStyle = "#FFFFFF";
			ctx.arc(currentObject.x, currentObject.y, currentObject.r, currentObject.s, currentObject.e);
			ctx.stroke();			
			ctx.closePath();
			break;
		}
		default:{
			return;
		}
	}
}

const timeScaleGroups = [0,1,5,10,50,100,500,1000,5000,60*1000,5*60*1000,60*60*1000];
function getFont(height){
	let fontSize = Math.min(16,Math.floor(height));
	return fontSize+"px sans-serif";
}
function buildXY(){
	let stepScale = 5;
	if(graphType === 'time'){
		let i=0;
		while(timeScaleGroups[i]<graphData.maxY && i<timeScaleGroups.length){i++;}
		stepScale = timeScaleGroups[i-1];
	}
	const yStep = Math.max(1,Math.ceil((graphData.maxY-graphData.minY)/stepScale));
	graphData.maxY = graphData.minY + (yStep * stepScale);
	
	const xMargin = w * .01;
	const yMargin = h * .01;
	
	const xLabels = [...new Set(graphData.DataPoints.map(x => `${x.taskNum}*${x.task?x.task.text:x.taskNum}`))]
		.map(x => { 
			const temp = x.split('*'); 
			return {taskNum:temp[0], text:temp[1]}
		});

	graphData.DataPoints.sort((a,b) => parseInt(b.instance)-parseInt(a.instance) || a.taskNum.localeCompare(b.taskNum));
	
	graphData.yAxis = 50;
	let xLabel = 0;
	const rot = Math.PI/8;
	const cos = Math.cos(rot);
	const sin = Math.sin(rot);

	const a = h/20 *cos;
	const b = (w-graphData.yAxis)/(xLabels.length+1) * sin;
	const fontHeight = Math.min(a,b);

	ctx.font = getFont(fontHeight);
	ctx.fillStyle = "#000000";
	ctx.strokeStyle="#000000";
	for(let i=0;i<xLabels.length;i++){
		const text = xLabels[i].text;
		const size = ctx.measureText(text).width;
		xLabel = Math.max(size, xLabel);
	}
	
	//xAxis
	graphData.xStep = (w - graphData.yAxis - xMargin - xMargin) / (xLabels.length);
	xLabel *= sin;
	graphData.xAxis = h - xLabel - yMargin - yMargin - (20 * sin);

	const labelPos = {};
	for(let i=0;i<xLabels.length;i++){
		const text = xLabels[i].text;
		const size = ctx.measureText(text).width;
		ctx.save();
		const x = graphData.xStep*(i+.5) + graphData.yAxis - (size*cos);
		const y = h - xLabel - yMargin + (size*sin);
		ctx.translate(x, y);
		ctx.rotate(-rot);
		ctx.fillText(text, 0,0);
		ctx.restore();
		
		labelPos[xLabels[i].taskNum] = graphData.xStep*(i+.5) + graphData.yAxis;
		ctx.beginPath();
		ctx.moveTo(graphData.xStep*(i+.5) + graphData.yAxis, graphData.xAxis-5);
		ctx.lineTo(graphData.xStep*(i+.5) + graphData.yAxis, graphData.xAxis);
		ctx.stroke();
		ctx.closePath();
	}

	//yAxis
	const ySpace = (graphData.xAxis - yMargin) / 5;
	for(let i=0;i<=5;i++){
		const text = graphType === 'time' ? formatTime(yStep*i*(stepScale/5)) : (yStep*i).toString();
		const size = ctx.measureText(text).width;
		const x = graphData.yAxis - size - 5;
		const y = graphData.xAxis - ySpace*i;
		ctx.fillText(text, x, y+Math.min(fontHeight/3,5));
		ctx.lineWidth=1;
		ctx.strokeStyle = "#CCCCCC";
		ctx.beginPath();
		ctx.moveTo(graphData.yAxis,y);
		ctx.lineTo(w,y);
		ctx.stroke();
		ctx.closePath();
	}
	
	ctx.beginPath();
	ctx.strokeStyle = "#000000";
	ctx.lineWidth=2;
	ctx.moveTo(graphData.yAxis, graphData.xAxis);
	ctx.lineTo(w, graphData.xAxis);
	ctx.moveTo(graphData.yAxis, 0);
	ctx.lineTo(graphData.yAxis, graphData.xAxis);
	ctx.stroke();
	ctx.closePath();
	
	graphData.xScale = (w - graphData.yAxis)/(graphData.maxX - graphData.minX) * .98;
	graphData.yScale = (graphData.xAxis)/(graphData.maxY - graphData.minY) * .98;

	return labelPos;
}
function buildStackedXY(){
	let stepScale = 5;
	if(graphType === 'time'){
		let i=0;
		while(timeScaleGroups[i]<graphData.maxY && i<timeScaleGroups.length){i++;}
		stepScale = timeScaleGroups[i-1];
	}
	const yStep = Math.max(1,Math.ceil((graphData.maxY-graphData.minY)/stepScale));
	graphData.maxY = graphData.minY + (yStep * stepScale);
	
	const xMargin = w * .01;
	const yMargin = h * .01;
	
	const xLabels = [...new Set(graphData.DataPoints.map(x => dateFormat(new Date(parseInt(x.instance)))))];
	graphData.DataPoints.sort((a,b) => parseInt(b.instance)-parseInt(a.instance) || a.taskNum.localeCompare(b.taskNum));
	
	graphData.yAxis = 100;
	let xLabel = 0;
	const rot = Math.PI/8;
	const cos = Math.cos(rot);
	const sin = Math.sin(rot);

	const a = h/20 *cos;
	const b = (w-graphData.yAxis)/(xLabels.length+1) * sin;
	const fontHeight = Math.min(a,b);

	ctx.font = getFont(fontHeight);
	ctx.fillStyle = "#000000";
	for(let i=0;i<xLabels.length;i++){
		const text = xLabels[i];
		const size = ctx.measureText(text).width;
		xLabel = Math.max(size, xLabel);
	}
	
	//xAxis
	const xStep = (w - graphData.yAxis - xMargin - xMargin) / (xLabels.length);
	xLabel *= sin;
	graphData.xAxis = h - xLabel - yMargin - yMargin - (20 * sin);

	const labelPos = {};
	for(let i=0;i<xLabels.length;i++){
		const text = xLabels[i];
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
	
	//yAxis
	const ySpace = (graphData.xAxis - yMargin) / 5;
	for(let i=0;i<=5;i++){
		const text = graphType === 'time' ? formatTime(yStep*i*(stepScale/5)) : (yStep*i).toString();
		const size = ctx.measureText(text).width;
		const x = graphData.yAxis - size - 5;
		const y = graphData.xAxis - ySpace*i;
		ctx.fillText(text, x, y+Math.min(fontHeight/3,5));
		
		ctx.strokeStyle = "#CCCCCC";
		ctx.beginPath();
		ctx.moveTo(graphData.yAxis,y);
		ctx.lineTo(w,y);
		ctx.stroke();
		ctx.closePath();
	}
	
	ctx.beginPath();
	ctx.strokeStyle = "#000000";
	ctx.lineWidth=2;
	ctx.moveTo(graphData.yAxis, graphData.xAxis);
	ctx.lineTo(w, graphData.xAxis);
	ctx.moveTo(graphData.yAxis, 0);
	ctx.lineTo(graphData.yAxis, graphData.xAxis);
	ctx.stroke();
	ctx.closePath();
	
	graphData.xScale = (w - graphData.yAxis)/(graphData.maxX - graphData.minX) * .98;
	graphData.yScale = (graphData.xAxis)/(graphData.maxY - graphData.minY) * .98;

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
		ctx.stroke();
		ctx.closePath();
		
		ctx.beginPath();
		ctx.font = getFont(x2);
		ctx.fillStyle = "#000000";
		const text = datum.task?datum.task.text:datum.taskNum;
		const size = ctx.measureText(text);

		const tx = x1 + Math.min(20,x2-1);
		const ty = y1 + size.width + 5;

		ctx.save();
		ctx.translate(tx,ty);
		ctx.rotate(-Math.PI/2);
		ctx.fillText(text, 0,0);
		ctx.restore();
		ctx.closePath();
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

		ctx.font = getFont(graphData.yScale);
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
		const y1 = (graphData.yScale * i) + yMargin;
		const y2 = graphData.yScale;
		
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
	const r = Math.min(w,h)/2.1;
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
		
		const fontHeight = duration / twoPi * r;
		ctx.font = getFont(fontHeight);
		const text = datum.task?datum.task.text:datum.taskNum;
		const size = ctx.measureText(text);
		const maxWidth = Math.floor(r*.8);
		const tx = r-Math.min(size.width, maxWidth)-10;
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
		ctx.fillText(text, 0, 0, maxWidth);
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
		const tempX = labelPos[first.taskNum];
		const tempY = graphData.xAxis-((first.y-first.x)*graphData.yScale);
		graphObjects.push(new graphObject(tempX, tempY, null, null, 4, 0, twoPi, first));
		ctx.arc(tempX, tempY, 4,0,twoPi);
		
		ctx.fill();
		ctx.closePath();

	for(let j=1;j<taskNums.length;j++){
			const prev = graphData.DataPoints.find(x => x.instance === series[i] && x.taskNum === taskNums[j-1]);
			const datum = graphData.DataPoints.find(x => x.instance === series[i] && x.taskNum === taskNums[j]);

			const x = labelPos[datum.taskNum];
			const y = graphData.xAxis-((datum.y-datum.x)*graphData.yScale);
			graphObjects.push(new graphObject(x, y, null, null, 4, 0, twoPi, datum));

			ctx.beginPath();
			ctx.arc(x, y, 4,0,twoPi);
			ctx.fill();
			ctx.closePath();
			
			ctx.beginPath();
			ctx.moveTo(labelPos[prev.taskNum], graphData.xAxis-((prev.y-prev.x)*graphData.yScale));
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
		const tempX = labelPos[first.taskNum];
		const tempY = graphData.xAxis-(first.x*graphData.yScale);
		graphObjects.push(new graphObject(tempX, tempY, null, null, 4, 0, twoPi, first));
		ctx.arc(tempX, tempY, 4,0,twoPi);
		
		ctx.fill();
		ctx.closePath();
		
		for(let j=1;j<taskNums.length;j++){
			const prev = graphData.DataPoints.find(x => x.instance === series[i] && x.taskNum === taskNums[j-1]);
			const datum = graphData.DataPoints.find(x => x.instance === series[i] && x.taskNum === taskNums[j]);

			const x = labelPos[datum.taskNum];
			const y = graphData.xAxis-(datum.x*graphData.yScale);
			graphObjects.push(new graphObject(x, y, null, null, 4, 0, twoPi, datum));

			ctx.beginPath();
			ctx.arc(x, y, 4,0,twoPi);
			ctx.fill();
			ctx.closePath();
			
			ctx.beginPath();
			ctx.moveTo(labelPos[prev.taskNum], graphData.xAxis-(prev.x*graphData.yScale));
			ctx.lineTo(x, y);
			ctx.stroke();
			ctx.closePath();
		}
		ctx.closePath();
	}
}
function buildStackedPercentGraph(){
	const labelPos = buildStackedXY();
	const series = [...new Set(graphData.DataPoints.map(x => x.instance))];
	const taskNums = [...new Set(graphData.DataPoints.map(x => x.taskNum))].sort();

	for(let i=0;i<series.length;i++){
		ctx.strokeStyle = "#000000";
		ctx.lineWidth = 2;
		
		const dateLabel = dateFormat(new Date(parseInt(series[i])));
		const w = graphData.xScale * .8;
		const x = labelPos[dateLabel] - w/2;
		for(let j=0;j<taskNums.length;j++){
			const datum = graphData.DataPoints.find(x => x.instance === series[i] && x.taskNum === taskNums[j]);
			
			const y = graphData.xAxis-(datum.y*graphData.yScale);
			const h = (datum.y-datum.x)*graphData.yScale;
			graphObjects.push(new graphObject(x, y, w, h, null, null, null, datum));
			
			ctx.beginPath();
			ctx.fillStyle = graphColors[j % graphColors.length];
			ctx.rect(x, y, w, h);
			ctx.stroke();
			ctx.fill();
			ctx.closePath();
		}
	}
}
function buildStackedTotalGraph(){
	const labelPos = buildStackedXY();
	const series = [...new Set(graphData.DataPoints.map(x => x.instance))];
	const taskNums = [...new Set(graphData.DataPoints.map(x => x.taskNum))].sort();

	for(let i=0;i<series.length;i++){
		ctx.strokeStyle = "#000000";
		ctx.lineWidth = 2;
		
		const dateLabel = dateFormat(new Date(parseInt(series[i])));
		const w = graphData.xScale * .8;
		const x = labelPos[dateLabel] - w/2;
		for(let j=0;j<taskNums.length;j++){
			const datum = graphData.DataPoints.find(x => x.instance === series[i] && x.taskNum === taskNums[j]);

			const y = graphData.xAxis-((datum.x+datum.y)*graphData.yScale);
			const h = datum.y*graphData.yScale;
			graphObjects.push(new graphObject(x, y, w, h, null, null, null, datum));
			
			ctx.beginPath();
			ctx.fillStyle = graphColors[j % graphColors.length];
			ctx.rect(x, y, w, h);
			ctx.stroke();
			ctx.fill();
			ctx.closePath();
		}
	}
}
function buildStackedReminderGraph(){
	const labelPos = buildStackedXY();
	const series = [...new Set(graphData.DataPoints.map(x => x.instance))];
	const taskNums = [...new Set(graphData.DataPoints.map(x => x.taskNum))].sort();

	for(let i=0;i<series.length;i++){
		ctx.strokeStyle = "#000000";
		ctx.lineWidth = 2;
		
		const dateLabel = dateFormat(new Date(parseInt(series[i])));
		const w = graphData.xScale * .8;
		const x = labelPos[dateLabel] - w/2;
		for(let j=0;j<taskNums.length;j++){
			const datum = graphData.DataPoints.find(x => x.instance === series[i] && x.taskNum === taskNums[j]);
			
			const y = graphData.xAxis-((datum.x+datum.y)*graphData.yScale);
			const h = datum.y*graphData.yScale;

			graphObjects.push(new graphObject(x, y, w, h, null, null, null, datum));
			
			ctx.beginPath();
			ctx.fillStyle = graphColors[j % graphColors.length];
			ctx.rect(x, y, w, h);
			ctx.stroke();
			ctx.fill();
			ctx.closePath();
		}
	}
}
function buildGraph(){
	if(!ctx){return;}
	ctx.beginPath();
	ctx.fillStyle="#FFFFFF";
	ctx.rect(0,0,w,h);
	ctx.fill();
	ctx.closePath();
	
	graphObjects = [];
	
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
		case "stackedPercent":{
			buildStackedPercentGraph();
			break;
		}
		case "stackedTotal":{
			buildStackedTotalGraph();
			break;
		}
		case "stackedReminders":{
			buildStackedReminderGraph();
			break;
		}
		default:{
			return;
		}
	}
	
	drawCurrentObject();
	drawClickedObject();
}

let resizerDelay;
function resize(){
	clearTimeout(resizerDelay);
	resizerDelay = setTimeout(calcSize, 20);
}
function calcSize(){
	if(!graph){graph = document.getElementById("Graph");}
	const r = document.getElementById("graphWrapper").getBoundingClientRect();
	
	currentObject = null;
	clickedObject = null;
	
	w = r.width;
	h = r.height;

	graphObjects = [];
	graph.width = w;
	graph.height = h;

	ctx = graph.getContext('2d');
	
	ctx.fillStyle = "#FFFFFF";
	ctx.beginPath();
	ctx.fillRect(0,0,w,h);
	
	ctx.strokeStyle = "#000000";
	ctx.lineWidth = 1;
	ctx.rect(1,1,w-2,h-2);
	ctx.stroke();
	
	graphData.minX = 0;
	graphData.minY = 0;
	graphData.xScale = 0;
	graphData.yScale = 0;
	graphData.DataPoints = [];

	buildData();
	buildTable();
	buildGraph();
}

function analyze(){
	if(graphType === 'pie'){
		document.getElementById('modalSideArea').style.minWidth = "225px";
	}

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

	document.getElementById('resetGraph').classList.remove('hide');
	document.getElementById('saveGraphButtons').classList.remove('hide');
	calcSize();
}
