
//	Основи на Компютърната Графика
//	Модел 11121 - FPS - кадри в секунда
//	П. Бойчев, 2017


// конструктор на модела
MEIRO.Models.M11121 = function M11121(room)
{
	MEIRO.Model.apply(this, arguments);

	var floorGeometry = MEIRO.PRIMITIVE.GEOMETRY.CYLINDER;
	var wallGeometry = MEIRO.PRIMITIVE.GEOMETRY.CYLINDER;
	var silverStyle = new THREE.MeshPhongMaterial({color:'cornflowerblue',shininess:60});
	var silverStyle2 = new THREE.MeshPhongMaterial({color:'steelblue',shininess:260});
	
	var n = 30; //брой възли в пипало
	
	// възел от пипало
	function node()
	{
		var k = 0.9;
		
		var obj = new THREE.Object3D();
		obj.scale.set(k,k,k);
		obj.position.set(0,1,0);
		
		var floor = new THREE.Mesh(floorGeometry,silverStyle2);
		floor.scale.set(1,0.4,1);
		floor.position.set(0,1.2,0);
		obj.add(floor);

		var wall = new THREE.Mesh(floorGeometry,silverStyle);
		wall.scale.set(0.9,1,0.9);
		wall.position.set(0,0.5,0);
		obj.add(wall);
		
		return obj;
	}

	// пипало
	function tentacle()
	{
		var obj = new THREE.Object3D();
		var lastObj = obj;
		for (var i=1; i<n; i++)
		{
			lastObj.node = node();
			lastObj.add(lastObj.node);
			lastObj = lastObj.node;
		}
		
		var floor = new MEIRO.Cylinder();
		floor.scale.set(1,0.3,1);
		floor.position.set(0,1.2,0);
		obj.add(floor);

		return obj;
	}
	
	// квадропод
	this.quadropus = new THREE.Object3D();
	this.quadropus.tentacle = [];
	for (var i=0; i<4; i++)
	{
		var t = tentacle();
		if (i) t.rotation.set(0,i*2*Math.PI/3,THREE.Math.degToRad(-114));
		this.quadropus.tentacle.push(t);
		this.quadropus.add(t);
	}	
	
	var core = new MEIRO.Sphere(1.5);
	this.quadropus.add(core);
	
	this.light = [];
	for (var i=0; i<3; i++)
		this.light.push(new THREE.PointLight('white',1/2));
	
	this.lastTime = 0;
	this.fps = 0;
	this.skip = 0;
	this.speed = 1;
	this.speeds = [1,2,6,15,60];

	// бутон за превключване
	var that = this;
	this.toggle = new MEIRO.CornerButton('topLeft', function(){that.onToggle();}, 'СКОРОСТ', 'images/time.png');
	this.toggle.state = 0;
	this.toggle.hide();
	
	// текст
	this.element = document.createElement('div');
	this.element.style = 'font-size: 4em; font-weight:bold; color:rgba(0,0,0,0.75); position:absolute; top:0.1em; left:2em;';
	
	// сглобяване на целия модел
	this.image.add(this.quadropus);
	for (var i=0; i<3; i++)
		this.image.add(this.light[i]);
}

MEIRO.Models.M11121.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M11121.DIST = {MIN:10, MAX:40, HEIGHT:0};
MEIRO.Models.M11121.POS = {DIST:20, ROT_X:0.5, ROT_Y:0};
MEIRO.Models.M11121.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M11121.prototype.onAnimate = function(time)
{
	this.skip++;
	if (this.skip%this.speed)
		time = this.lastTime;
	else
	{
		this.fps = THREE.Math.lerp(this.fps,1000/(time-this.lastTime),0.5);
		this.element.innerHTML = this.fps.toFixed(0)+' fps';
	}
	this.lastTime = time;
	
	this.quadropus.rotation.x = rpm(time,1);
	this.quadropus.rotation.y = rpm(time,2);
	this.quadropus.rotation.z = rpm(time,1);

	for (var i=0; i<4; i++)
	{
		var range = 4;
		var obj = this.quadropus.tentacle[i];
		var j = 0;
		while (obj.node)
		{
			j++;
			var offset = 6*Math.sin(rpm(time,4)+i+j/15);
			obj.node.rotation.x = Math.sin(rpm(time,11.4)+offset)/range;
			obj.node.rotation.y = Math.sin(rpm(time,9.0)+offset)/range;
			obj.node.rotation.z = Math.cos(rpm(time,7.7)+offset)/range;
			range *= 0.99;
			obj = obj.node;
		}
	}
	
	for (var i=0; i<3; i++)
	{
		var a = i/3*2*Math.PI + rpm(time+Math.sin(time),10);
		this.light[i].position.set(5*Math.cos(a),0,5*Math.sin(a));
	}
	
	reanimate();
}



// информатор на модела
MEIRO.Models.M11121.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>FPS - кадри в секунда</h1>';

	s += '<p>Брой кадри в секунда (<em>FPS</em>,<em>Frames per second</em>) определят колко гладко ще изглежда анимация. В този модел се прави симулация на 5 различни скорости със следните стойности:</p>';
	s += '<p><ul>';
	s += '<li>максимална скорост, 60 fps</li>';
	s += '<li>гладка анимация, 30 fps</li>';
	s += '<li>леко накъсване, 10 fps</li>';
	s += '<li>сериозно накъсване, 4 fps</li>';
	s += '<li>отделни кадри, няма анимация, 1 fps</li></ul></p>';
	s += '<p>Показаните скорости са очаквани. Според скоростта на устройството, те могат да са по-малки или по-големи.</p>';
	
	element.innerHTML = s;
}

MEIRO.Models.M11121.prototype.onEnter = function()
{
	MEIRO.Model.prototype.onEnter.call(this);
	document.body.appendChild(this.element);
}

MEIRO.Models.M11121.prototype.onExit = function()
{
	MEIRO.Model.prototype.onExit.call(this);
	document.body.removeChild(this.element);
}



// превключвател на модела
MEIRO.Models.M11121.prototype.onToggle = function(element)
{
	this.toggle.state = (this.toggle.state+1)%this.speeds.length;
	this.speed = this.speeds[this.toggle.state];

	reanimate();
}
