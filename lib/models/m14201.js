
//	Основи на Компютърната Графика
//	Модел 14201 - Ориентация на телескоп
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M14201 = function M14201(room, model)
{
	MEIRO.Model.apply(this, arguments);

	// сграда
	var material = new THREE.MeshPhongMaterial({color:'whitesmoke',side:THREE.DoubleSide});
	var building = new THREE.Mesh(
		new THREE.CylinderGeometry(3.9,4,4,options.lowpoly?12:24,1,true),
		material );

	// купол
	var material = new THREE.MeshPhongMaterial({color:'lightgray',side:THREE.DoubleSide,shading:THREE.FlatShading});
	this.dome = new THREE.Object3D();
	var dome1 = new THREE.Mesh(
		new THREE.SphereGeometry(4,options.lowpoly?12:24,options.lowpoly?6:12,0,Math.PI,0,Math.PI/2-0.175),
		material );
	dome1.rotation.x = -Math.PI/2;
	var dome2 = new THREE.Mesh(
		dome1.geometry,
		material );
	dome2.rotation.x = -Math.PI/2;
	dome2.scale.set(-1,-1,1);
	var dome3 = new THREE.Mesh(
		new THREE.SphereGeometry(4,options.lowpoly?6:12,options.lowpoly?1:3,0,Math.PI/2,Math.PI/2-0.175,2*0.175),
		material );
	dome3.rotation.x = -Math.PI/2;
	this.dome.add(dome1,dome2,dome3);
	this.dome.position.y = 1.8;

	// телескоп
	var material = new THREE.MeshPhongMaterial({color:'lightgray',side:THREE.DoubleSide});
	this.telescope = new THREE.Mesh(
		new THREE.CylinderGeometry(0.6,0.5,3.6,options.lowpoly?8:24,1,true),
		material );
	this.telescope.position.y = 1;	
	this.telescope.geometry.translate(0,2,0);

	// леща
	var lens = new MEIRO.Sphere(0.6);
	lens.material = new THREE.MeshPhongMaterial({color:'cornflowerblue',side:THREE.DoubleSide,transparent:true,opacity:0.8,shininess:200});
	lens.scale.set(0.55,0.1,0.55);
	lens.position.set(0,3.7,0);
	this.telescope.add(lens);
	
	// посока
	var dir = new MEIRO.Vector(new THREE.Vector3(0,1,0),6,'blue',1);
	this.telescope.add(dir);
	
	// допълнителна светлина
	var light = new THREE.PointLight('white',0.4);
	light.position.set(0,10,0);
	
	// сглобяване на целия модел
	this.image.add(building,this.dome,this.telescope,light);
}

MEIRO.Models.M14201.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M14201.DIST = {MIN:10, MAX:20, HEIGHT:-2};
MEIRO.Models.M14201.POS = {DIST:15, ROT_X:0.9, ROT_Y:0};
MEIRO.Models.M14201.ROT_Y = {MIN:-0.1, MAX:0.1};



// аниматор на модела
MEIRO.Models.M14201.prototype.onAnimate = function(time)
{	
	// ъгли на завъртане
	var alpha = rpm(time,4)+2*Math.sin(rpm(time,2));
	var beta = -Math.PI/4+0.5*Math.cos(rpm(time,10));
	
	// купол
	this.dome.rotation.y = alpha;
	
	// телескоп
	this.telescope.rotation.set(0,alpha,beta,'YXZ');
	
	reanimate();
}



// информатор на модела
MEIRO.Models.M14201.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Ориентация на телескоп</h1>';

	s += '<p>Произволна ориентация на телескоп може да се определи само с два ъгъла &ndash; хоризонтално и вертикално завъртане. Това е достатънчно, за да се насочи телескопа пък произволна точка в пространството, ако няма конструктивни проблеми за това. Защо в този конкретен случай не е нужен трети ъгъл?</p>';

	element.innerHTML = s;
}