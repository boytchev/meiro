
//	Основи на Компютърната Графика
//	Модел 28301 - Сянка с проекция
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M28301 = function M28301(room)
{
	MEIRO.Model.apply(this, arguments);

	var floor = new MEIRO.Cube(1);
	floor.scale.set(7,0.1,7);
	floor.material = new THREE.MeshBasicMaterial({color:'burlywood'});

	this.object = new THREE.Object3D();
	this.subObject = new THREE.Object3D();
		var p = new THREE.Mesh(new THREE.RingGeometry(2-0.2,2+0.2,6,1));
		p.rotation.set(Math.PI/2,Math.PI/6,0,'YXZ');
		this.subObject.add(p);
		var geometry = new THREE.RingGeometry(2-0.2,2+0.2,4,1);
		var p = new THREE.Mesh(geometry);
		p.rotation.y = Math.PI/6;
		this.subObject.add(p);
		var p = new THREE.Mesh(geometry);
		p.rotation.y = -Math.PI/6;
		this.subObject.add(p);
		var p = new THREE.Mesh(geometry);
		p.rotation.y = Math.PI*(1/3+1/6);
		this.subObject.add(p);
		
	this.object.add(this.subObject);
	this.object.position.y = 4;
	
	var material = new THREE.MeshPhongMaterial({color:'cornflowerblue', shininess:50, side:THREE.DoubleSide});
	this.object.traverse(function (obj){obj.material = material;});
	
	this.shadow = this.object.clone();
	this.shadow.scale.set(1,0.001,1);
	this.shadow.position.y = 0.1;
	
	var material = new THREE.MeshBasicMaterial({color:'black',side:THREE.DoubleSide});
	this.shadow.traverse(function (obj){obj.material = material;});
	
	// сглобяване на целия модел
	this.image.add(floor,this.object,this.shadow);
}

MEIRO.Models.M28301.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M28301.DIST = {MIN:5, MAX:20, HEIGHT:-3};
MEIRO.Models.M28301.POS = {DIST:10, ROT_X:0, ROT_Y:0.3};
MEIRO.Models.M28301.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M28301.prototype.onAnimate = function(time)
{
	this.object.children[0].rotation.set(3*Math.sin(rpm(time,3)),2*Math.cos(rpm(time,5)),0);
	this.shadow.children[0].rotation.set(3*Math.sin(rpm(time,3)),2*Math.cos(rpm(time,5)),0);
	reanimate();
}



// информатор на модела
MEIRO.Models.M28301.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Сянка с проекция</h1>';

	s += '<p>Сянка на сложни обекти може да се генерира чрез повторно дефиниране на обекта с всичките му елементи. Мащабът по двете оси на новия обект се запазва, докато по третата се занулява (или почти занулява). По този начин обектът ще бъде сплескан в равнина и може да се използва като сянка на оригиналния обект.</p>';
	element.innerHTML = s;
}