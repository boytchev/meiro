
//	Основи на Компютърната Графика
//	Модел 17081 - Конични сечения с изрязващи равнини
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M17081 = function M17081(room)
{
	MEIRO.Model.apply(this, arguments);

	// конуси
	var geometry = new THREE.ConeGeometry(1,3,options.lowpoly?12:40);
	
	// конус за окръжност
	//var v = new THREE.Vector3(0,-1,0);
	//var p = new THREE.Vector3(this.room.max.x/2-this.image.scale.x*2.5,this.room.level.levelIndex*MEIRO.STAIRS.HEIGHT+0.5,this.room.max.z/2);
	var p = new THREE.Vector3(0,0,0).multiplyScalar(this.image.scale.x).add(this.image.position);
	var v = new THREE.Vector3(0,-1,0);
	this.coneA = new THREE.Mesh(
		geometry, 
		new THREE.MeshLambertMaterial({
			color: 'cornflowerblue',
			clippingPlanes: [new THREE.Plane().setFromNormalAndCoplanarPoint(v,p)],
			side: THREE.DoubleSide,
		})
	);
	this.cA = this.coneA.material.clippingPlanes[0].constant;
	var coneA2 = new THREE.Mesh(geometry,MEIRO.PRIMITIVE.STYLE.PLATE);
	
	// конус за хипербола
	var p = new THREE.Vector3(2.5,0,0).multiplyScalar(this.image.scale.x).add(this.image.position);
	var v = new THREE.Vector3(0,0,-1);
	this.coneB = new THREE.Mesh(
		geometry, 
		new THREE.MeshLambertMaterial({
			color: 'cornflowerblue',
			clippingPlanes: [new THREE.Plane().setFromNormalAndCoplanarPoint(v,p)],
			side: THREE.DoubleSide,
		})
	);
	this.cB = this.coneB.material.clippingPlanes[0].constant;
	this.coneB.position.x = 2.5;
	var coneB2 = new THREE.Mesh(geometry,MEIRO.PRIMITIVE.STYLE.PLATE);
	coneB2.position.x = 2.5;
	
	// конус за елипса
	var p = new THREE.Vector3(-2.5,0.25,0).multiplyScalar(this.image.scale.x).add(this.image.position);
	var v = new THREE.Vector3(0,-1,-1).normalize();
	this.coneC = new THREE.Mesh(
		geometry, 
		new THREE.MeshLambertMaterial({
			color: 'cornflowerblue',
			clippingPlanes: [new THREE.Plane().setFromNormalAndCoplanarPoint(v,p)],
			side: THREE.DoubleSide,
		})
	);
	this.cC = this.coneC.material.clippingPlanes[0].constant;
	this.coneC.position.x = -2.5;
	var coneC2 = new THREE.Mesh(geometry,MEIRO.PRIMITIVE.STYLE.PLATE);
	coneC2.position.x = -2.5;
	
	// сглобяване на целия модел
	this.image.add(this.coneA, coneA2, this.coneB, coneB2, this.coneC, coneC2);
}

MEIRO.Models.M17081.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M17081.DIST = {MIN:5, MAX:20, HEIGHT:0};
MEIRO.Models.M17081.POS = {DIST:10, ROT_X:1, ROT_Y:0.5};
MEIRO.Models.M17081.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M17081.prototype.onAnimate = function(time)
{
	this.coneA.material.clippingPlanes[0].constant = this.cA+0.1*Math.sin(rpm(time,13));
	this.coneB.material.clippingPlanes[0].constant = this.cB+0.1*Math.cos(rpm(time,11));
	this.coneC.material.clippingPlanes[0].constant = this.cC+0.05*Math.sin(rpm(-time,9));
	
	reanimate();
}



// информатор на модела
MEIRO.Models.M17081.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Конични сечения с изрязващи равнини</h1>';

	s += '<p>Този модел е демонстрация на генериране на конични сечения чрез пресичане на конус с равнина. Наклонът на равнината зависи от първите три коефициента <em>a</em>, <em>b</em> и <em>c</em> в уравнението ѝ <em>ax+by+cz+d &gt; 0</em>. Последният коефициент <em>d</em> премества равнината, като запазва ориентацията ѝ.</p>';
	element.innerHTML = s;
}


MEIRO.Models.M17081.prototype.onEnter = function()
{
	renderer.localClippingEnabled = true;
	MEIRO.Model.prototype.onEnter.call(this);
}


MEIRO.Models.M17081.prototype.onExit = function()
{
	renderer.localClippingEnabled = false;
	MEIRO.Model.prototype.onExit.call(this);
}
