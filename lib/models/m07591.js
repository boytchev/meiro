
//	Основи на Компютърната Графика
//	Модел 07591 - Разклонени цветове
//	П. Бойчев, 2017


// конструктор на модела
MEIRO.Models.M07591 = function M07591(room)
{
	MEIRO.Model.apply(this, arguments);

	// колело
	this.wheel = 0;
	this.wheel = new THREE.Mesh(new THREE.CylinderGeometry(1,1,0.2,options.lowpoly?20:60));
	this.wheel.scale.set(4,1,4);
	this.wheel.rotation.z = Math.PI/2;
	this.colorizeWheel(this.wheel);

	// рамка
	this.frame = 0;
	this.frame = new THREE.Mesh(new THREE.CylinderGeometry(1.02,1.02,0.18,options.lowpoly?20:60),new THREE.MeshBasicMaterial({color:'black'}));
	this.frame.scale.set(4,1,4);
	this.frame.rotation.z = Math.PI/2;
	
	// център
	this.point = new MEIRO.Point();
	this.point.material = new THREE.MeshBasicMaterial({color:'black'});
	
	this.span = THREE.Math.degToRad(30); // разпереност 30°
	
	// пръстени, линии и блокове
	this.n = 5; // максимален брой
	this.m = 2; // видим брой
	this.rings = [];
	this.lines = [];
	this.blocks = [];
	this.blockFrames = [];
	var material = new THREE.LineBasicMaterial({color:'black'});
	for (var i=0; i<this.n; i++)
	{
		var r = new THREE.Line(MEIRO.PRIMITIVE.GEOMETRY.CIRCLE,material);
		r.rotation.y = Math.PI/2;
		r.distance = 2;
		r.angle = i*2*Math.PI/this.n;
		r.scale.set(0.2,0.2,0.2);
		this.rings.push(r);
		
		var l = new MEIRO.Line();
		l.material = material;
		l.setFromTo(new THREE.Vector3(0.11,0,0),new THREE.Vector3(0.11,(r.distance-0.2)*Math.cos(r.angle),(r.distance-0.2)*Math.sin(r.angle)));
		this.lines.push(l);
		
		var a = -1.2+i/5;
		var b = new MEIRO.Cube(1);
		b.material = new THREE.MeshBasicMaterial({color:'black'});
		b.scale.set(0.11,2,0.75);
		b.position.set(0,4*Math.cos(a),4*Math.sin(a));
		b.rotation.set(a,0,0);
		this.blocks.push(b);
		
		var b = b.clone();
		b.material = new THREE.MeshBasicMaterial({color:'black'});
		b.scale.set(0.09,2+0.05,0.75+0.05);
		this.blockFrames.push(b);
		
		this.setPositionRA(i,2,i/this.n*Math.PI*2);
	}
	
	// бутон за превключване
	var that = this;
	this.toggle = new MEIRO.CornerButton('topLeft', function(){that.onToggle();}, '', 'images/n345.png');
	this.toggle.state = -1;
	this.toggle.stateTexts = ['Три цвята','Четири цвята','Пет цвята'];
	this.toggle.setText(this.toggle.stateTexts[this.toggle.state]);
	this.toggle.hide();
	this.onToggle();

	this.raycaster = new THREE.Raycaster();
	this.mouse = new THREE.Vector2();
	
	// сглобяване на целия модел
	this.image.add(this.wheel,this.frame,this.point);
	for (var i=0; i<this.n; i++) this.image.add(this.rings[i],this.lines[i],this.blocks[i],this.blockFrames[i]);
}

MEIRO.Models.M07591.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M07591.DIST = {MIN:10, MAX:20, HEIGHT:0};
MEIRO.Models.M07591.POS = {DIST:13, ROT_X:0, ROT_Y:0};
MEIRO.Models.M07591.ROT_Y = {MIN:-0.1, MAX:0.7};


MEIRO.Models.M07591.prototype.setPositionYZ = function(index,y,z)
{
	var ring = this.rings[index];
	ring.position.set(0.11,y,z);
	ring.distance = Math.sqrt(y*y+z*z);
	ring.angle = Math.atan2(z,y);
	this.blocks[index].material.color = this.calcWheelColor(ring.distance*Math.cos(ring.angle)/4,ring.distance*Math.sin(ring.angle)/4);
}


MEIRO.Models.M07591.prototype.setPositionRA = function(index,r,a)
{
	var ring = this.rings[index];
	ring.position.set(0.11,r*Math.cos(a),r*Math.sin(a));
	ring.distance = r;
	ring.angle = a;
	this.blocks[index].material.color = this.calcWheelColor(ring.distance*Math.cos(ring.angle)/4,ring.distance*Math.sin(ring.angle)/4);
}


MEIRO.Models.M07591.prototype.onObjectPos = function()
{
	// координати на мишка
	this.mouse.x = (controls.human.mousePos.x/window.innerWidth)*2 - 1;
	this.mouse.y = -(controls.human.mousePos.y/window.innerHeight)*2 + 1;

	this.raycaster.setFromCamera( this.mouse, camera );
	var intersects = this.raycaster.intersectObject( this.wheel );
	if (intersects.length)
	{
		var p = intersects[0].point;
		p.sub(this.image.position).divide(this.image.scale);
		return p;
	}
	return undefined;
}


MEIRO.Models.M07591.prototype.onObject = function()
{
	// координати на мишка
	this.mouse.x = (controls.human.mousePos.x/window.innerWidth)*2 - 1;
	this.mouse.y = -(controls.human.mousePos.y/window.innerHeight)*2 + 1;

	this.raycaster.setFromCamera( this.mouse, camera );
	var intersects = this.raycaster.intersectObject( this.wheel );
	if (intersects.length)
	{
		var p = intersects[0].point;
		p.sub(this.image.position).divide(this.image.scale);
		
		// кой е най-близо до p?
		var minIndex = -1;
		var minDist = 100;
		for (var i=0; i<this.n; i++)
		{
			var dist = p.distanceTo(this.rings[i].position);
			if (dist<minDist)
			{
				minDist = dist;
				minIndex = i;
			}
		}
		if (minDist>=0 && minDist<0.25)
		{
			this.dragIndex = minIndex;
			return p;
		}
	}
	return undefined;
}


// интерактор на модела
MEIRO.Models.M07591.prototype.onDragMove = function()
{
	var p = this.onObjectPos();
	if (p)
	{
		var r = this.rings[this.dragIndex];
		this.setPositionYZ(this.dragIndex,p.y,p.z);
		if (this.dragIndex)
		{
			var a = r.angle-this.rings[0].angle-Math.PI;
			a = (a%(2*Math.PI)+2*Math.PI)%(2*Math.PI);
			if (a>=Math.PI) a-=2*Math.PI;
			
			if (this.dragIndex==1 || this.dragIndex==this.m-1)
				a = THREE.Math.clamp(a,-Math.PI/2,Math.PI/2);
			else
				a = THREE.Math.clamp(a,-Math.PI/6,Math.PI/6);
			
			console.log(a,THREE.Math.radToDeg(a));
			if (this.m/2!=this.dragIndex)
				this.span = a/(this.m/2-this.dragIndex);
		}
		
		for (var i=0; i<this.m; i++)
		{
			var q = this.rings[i];
			
			if (i)
				this.setPositionRA(i,q.distance,this.rings[0].angle+Math.PI+(this.m/2-i)*this.span);

			this.lines[i].setTo(new THREE.Vector3(0.11,(q.distance-0.2)*Math.cos(q.angle),(q.distance-0.2)*Math.sin(q.angle)));
			this.blocks[i].material.color = this.calcWheelColor(q.distance*Math.cos(q.angle)/4,q.distance*Math.sin(q.angle)/4);
		}
	}
}


// аниматор на модела
MEIRO.Models.M07591.prototype.onAnimate = function(time)
{
//	TWEEN.update();
//	reanimate();
}



// информатор на модела
MEIRO.Models.M07591.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Разклонени цветове</h1>';

	s += '<p>При избор на разклонени цветове има един основен самостоятелен цвят. Всички останали са разположени равномерно срещу него и са с относително близка цветност.</p>';
	element.innerHTML = s;
}



// превключвател на модела
MEIRO.Models.M07591.prototype.onToggle = function(element)
{
	this.toggle.state = (this.toggle.state+1)%3;
	this.toggle.setText(this.toggle.stateTexts[this.toggle.state]);
	this.m = this.toggle.state+3;
	
	for (var i=0; i<this.n; i++)
	{
		this.rings[i].visible = i<this.m;
		this.lines[i].visible = i<this.m;
		this.blocks[i].visible = i<this.m;
		this.blockFrames[i].visible = i<this.m;
	}
	
	this.span = THREE.Math.clamp(this.span,-Math.PI/(this.m-2),Math.PI/(this.m-2));
	var r = this.rings[0];
	for (var i=1; i<this.m; i++)
	{
		var q = this.rings[i];
		var a = r.angle+Math.PI+(this.m/2-i)*this.span;
		
		this.setPositionRA(i,q.distance,a);
		this.lines[i].setTo(new THREE.Vector3(0.11,(q.distance-0.2)*Math.cos(q.angle),(q.distance-0.2)*Math.sin(q.angle)));
		this.blocks[i].material.color = this.calcWheelColor(q.distance*Math.cos(q.angle)/4,q.distance*Math.sin(q.angle)/4);
	}
	
	reanimate();
}



MEIRO.Models.M07591.prototype.calcWheelColor = function (x,z)
{
	function coss(x)
	{
		x = (x+360)%360;
		var d = Math.floor(x/60);
		switch (d)
		{
			case 0:
			case 5: return 1;
			case 2:
			case 3: return 0;
			case 1:	return 0.5+0.5*Math.cos( (x-60)/60*Math.PI );
			case 4:	return 0.5-0.5*Math.cos( (x-240)/60*Math.PI );
		}
		return 0;
	}
	var vec = new THREE.Vector2(x,z);
	
	var h = THREE.Math.radToDeg(-vec.angle());
	var s = Math.sqrt(x*x+z*z);
	var v = 1;

	var c = v*s;
	var m = v-c;
	return new THREE.Color().setRGB(m+c*coss(h),m+c*coss(h+120),m+c*coss(h+240));
}

MEIRO.Models.M07591.prototype.colorizeWheel = function (object)
{
	object.material = new THREE.MeshBasicMaterial({vertexColors: THREE.VertexColors, side:THREE.DoubleSide});

	var faceIndices = ['a','b','c'];
	var geometry = object.geometry;

	var that = this;
	
	geometry.faces.forEach(
		function(face)
		{
			for (var i = 0; i < 3; i++)
			{
				var vertexIndex = face[faceIndices[i]];
				var vertex = geometry.vertices[vertexIndex];
				face.vertexColors[i] = that.calcWheelColor(vertex.x,vertex.z);
			}
		}
	);		
}