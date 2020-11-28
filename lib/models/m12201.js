
//	Основи на Компютърната Графика
//	Модел 12201 - Петорно махало
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M12201 = function M12201(room)
{
	MEIRO.Model.apply(this, arguments);

	var black = new THREE.MeshPhongMaterial({color:'black',shininess:150});
	var gold = new THREE.MeshPhongMaterial({color:'orange',shininess:150});
	
	// едно махало
	function pendulum(size)
	{
		var p = new THREE.Object3D();
		p.scale.set(size,size,size);
		
		var rod = new MEIRO.Cylinder(0.03,1);
		rod.position.set(0,0.5,0);
		rod.material = black;
		
		var ring = new MEIRO.Sphere(1);
		ring.scale.set(0.3,0.3,0.07);
		ring.position.set(0,1.2,0);
		ring.material = black;
		
		var ball = new MEIRO.Sphere(1);
		ball.scale.set(0.27,0.27,0.11);
		ball.position.set(0,1.2,0);
		ball.material = gold;
		
		p.add(rod,ring,ball);

		return p;
	}
	
	// махало
	this.pendulum = [];
	this.pendulum.push(pendulum(3));
	this.pendulum.push(pendulum(2));
	this.pendulum.push(pendulum(4/3));
	this.pendulum.push(pendulum(8/9));
	this.pendulum.push(pendulum(16/27));

	// светлини
	light1 = new THREE.PointLight('white',1/3);
	light1.position.set(15,0,4);
	light2 = new THREE.PointLight('white',1/3);
	light2.position.set(-15,5,-4);
	
	// сглобяване на целия модел
	for (var i=0; i<this.pendulum.length; i++)
		this.image.add(this.pendulum[i]);
	this.image.add(light1,light2);
}

MEIRO.Models.M12201.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M12201.DIST = {MIN:5, MAX:20, HEIGHT:0};
MEIRO.Models.M12201.POS = {DIST:12, ROT_X:Math.PI/2, ROT_Y:0.1};
MEIRO.Models.M12201.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M12201.prototype.onAnimate = function(time)
{
	var angle = Math.PI+Math.sin(rpm(time,20));
	this.pendulum[0].position.set(0,6,0);
	this.pendulum[0].rotation.set(0,0,angle);
	
	this.pendulum[1].position.set(-3.6*Math.sin(angle),3.6*Math.cos(angle),0);
	this.pendulum[1].position.add(this.pendulum[0].position);
	var angle = Math.PI+1.3*Math.sin(rpm(time,20)-1);
	this.pendulum[1].rotation.set(0,0,angle);
	
	this.pendulum[2].position.set(-2.4*Math.sin(angle),2.4*Math.cos(angle),0);
	this.pendulum[2].position.add(this.pendulum[1].position);
	var angle = Math.PI+1.8*Math.sin(rpm(time,20)-1.3);
	this.pendulum[2].rotation.set(0,0,angle);
	
	this.pendulum[3].position.set(-1.2*4/3*Math.sin(angle),1.2*4/3*Math.cos(angle),0);
	this.pendulum[3].position.add(this.pendulum[2].position);
	var angle = Math.PI+1.9*Math.sin(rpm(time,20)-2);
	this.pendulum[3].rotation.set(0,0,angle);
	
	this.pendulum[4].position.set(-1.2*8/9*Math.sin(angle),1.2*8/9*Math.cos(angle),0);
	this.pendulum[4].position.add(this.pendulum[3].position);
	var angle = Math.PI+2*Math.sin(rpm(time,20)-2.5);
	this.pendulum[4].rotation.set(0,0,angle);
	
	reanimate();
}



// информатор на модела
MEIRO.Models.M12201.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Петорно махало</h1>';

	s += '<p>Движението по дъга се прави по същия начин, както и движение по окръжност. Разликата е, че ъгълъг е ограничен в някакъв интервал.</p>';
	
	element.innerHTML = s;
}