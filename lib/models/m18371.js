
//	Основи на Компютърната Графика
//	Модел 18371 - Огледалната стая
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M18371 = function M18371(room)
{
	MEIRO.Model.apply(this, arguments);


	// стени
	this.walls = new THREE.Object3D();
	this.lastWall;
	var centers = [1,0, 2,1, 3,2, 4,3, 5,3, 6,1, 7,0, 7,-1, 5,-2, 4,-3, 3,-3, 1,-3, 0,-3, -1,-2, -3,-3, -4,-3, -5,-2, -7,-1, -7,0, -6,1, -5,3, -4,3, -3,2, -2,1, -1,0];
	var orientations = '-|-|\\|-/-|\\/|-/|-\\-|/|-|-';
	var geometry = new THREE.PlaneGeometry(2,1);
	var material = new THREE.MeshLambertMaterial({color:'cornflowerblue',transparent:true,opacity:0.75,side:THREE.DoubleSide});
	for (var i=0; i<centers.length/2; i++)
	{
		var ch = orientations[i];
		var wall = new THREE.Mesh(geometry,material);
		wall.ch = ch;
		switch (ch)
		{
			case '-': break;
			case '|': wall.rotation.y = Math.PI/2; break;
			case '/': wall.rotation.y =-Math.PI/4; wall.scale.x = Math.sqrt(2); break;
			case '\\': wall.rotation.y = Math.PI/4; wall.scale.x = Math.sqrt(2); break;
		}
		wall.position.set(centers[2*i],0,centers[2*i+1]);

		this.walls.add(wall);
	}
	
	// лъч
	this.n = 150;
	this.rayNo = -1;
	this.angle = 0;
	this.rays = [];
	for (var i=0; i<this.n; i++)
	{
		var ray = new MEIRO.Line();
		ray.renderOrder = -1;
		ray.material = new THREE.LineBasicMaterial({color:'black',transparent:true,opacity:1-i/this.n});
		//ray.material.color.setHSL(0/360,1,i/this.n);
		ray.visible = false;
		this.rays.push(ray);
	}
	
	// точки
	this.pointA = new MEIRO.Cylinder(0.02,1);
	this.pointA.position.set(-4,0,0);
	this.pointA.material = new THREE.MeshLambertMaterial({color:'red'});

	this.pointB = new MEIRO.Cylinder(0.02,1);
	this.pointB.position.set(4,0,0);
	this.pointB.material = this.pointA.material;
		
	this.raycaster = new THREE.Raycaster();
	
	// бутон за превключване
	var that = this;
	this.toggle = new MEIRO.CornerButton('topLeft', function(){that.onToggle();}, 'НОВ ЛЪЧ', 'images/random.png');
	this.toggle.hide();
	
	var light = new THREE.AmbientLight('blue',0.5);
	
	// сглобяване на целия модел
	this.image.add(this.pointA,this.pointB,light);
	for (var i=0; i<this.rays.length; i++)
		this.image.add(this.rays[i]);
	//for (var i=0; i<this.walls.length; i++)
		this.image.add(this.walls);//[i]);
}

MEIRO.Models.M18371.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M18371.DIST = {MIN:1, MAX:20, HEIGHT:0};
MEIRO.Models.M18371.POS = {DIST:15, ROT_X:-1, ROT_Y:0.7};
MEIRO.Models.M18371.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M18371.prototype.onAnimate = function(time)
{
	if (this.rayNo>=this.n) return;
	if (this.rayNo<0) return;
		
	var ray = this.rays[this.rayNo];
	var origin = ray.getFrom();
	var direction = new THREE.Vector3(Math.cos(this.angle),0,Math.sin(this.angle));
	
	origin = origin.clone().multiplyScalar(this.image.scale.x).add(this.image.position);

	this.raycaster.set(origin,direction);
	var isect = this.raycaster.intersectObject(this.walls,true);
	
	if (isect.length>0 && this.rayNo<211)
	{
		var idx = (this.lastWall==isect[0].object)?1:0;
		this.lastWall = isect[idx].object;

		var to = isect[idx].point.sub(this.image.position).multiplyScalar(1/this.image.scale.x);
		ray.setTo(to);
		ray.visible = true;
		
		this.rayNo++;
		if (this.rayNo<this.n)
		{
			this.rays[this.rayNo].setFrom(to);
			switch (this.lastWall.ch)
			{
				case '-': this.angle = -this.angle; break;
				case '|': this.angle = Math.PI-this.angle; break;
				case '/': this.angle = Math.PI/2-this.angle; break;
				case '\\': this.angle = 3*Math.PI/2-this.angle; break;
			}
		}
		reanimate();
	}
	else
	{
		var to = ray.getFrom().add(direction);
		ray.setTo(to);
		ray.visible = true;
		this.rayNo = -1;
	}
}



// информатор на модела
MEIRO.Models.M18371.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Огледалната стая</h1>';

	s += '<p>През 1997 г. Д. Кастро предлага 24-ъгълна стая огледална стая. Светлинен лъч, започващ от едната маркирана точка, не може да освети другата маркирана точка независимо след колко отразявания от огледалата по стените.</p>';
	
	element.innerHTML = s;
}


// превключвател на модела
MEIRO.Models.M18371.prototype.onToggle = function(element)
{	
	this.lastWall = undefined;
	this.rayNo = 0;
	for (var i=0; i<this.n; i++)
		this.rays[i].visible = false;

	this.angle = THREE.Math.randFloat(0,2*Math.PI);
	this.rays[this.rayNo].setFrom(this.pointA.position);
	
	reanimate();
}
	