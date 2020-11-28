
//	Основи на Компютърната Графика
//	Модел 18341 - Отражение на лъч от сфера
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M18341 = function M18341(room)
{
	MEIRO.Model.apply(this, arguments);

	this.time = 0;
	this.speed = 0;

	this.n = 50;
	
	// равнина
	this.sphere = new MEIRO.Sphere(3);
	this.sphere.material = new THREE.MeshPhongMaterial({color:'red',shininess:200});
	
	// лъчи
	var linesGeometry = new THREE.Geometry();
	this.speeds = [];
	this.offsets = [];
	for (var i=0; i<2*this.n; i++)
	{
		linesGeometry.vertices.push(new THREE.Vector3());
		this.speeds.push(THREE.Math.randFloat(-20,20));
		this.offsets.push(THREE.Math.randFloat(0,2*Math.PI));
	}
	this.lines = new THREE.LineSegments(linesGeometry,new THREE.LineBasicMaterial({color:'gold'}));
	this.refLines = new THREE.LineSegments(linesGeometry.clone(),new THREE.LineBasicMaterial({color:'black'}));
	
	// бутон за превключване
	var that = this;
	this.toggle = new MEIRO.CornerButton('topLeft', function(){that.onToggle();}, 'СТАРТ', 'images/start.stop.png');
	this.toggle.hide();

	// сглобяване на целия модел
	this.image.add(this.lines, this.refLines, this.sphere);
}

MEIRO.Models.M18341.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M18341.DIST = {MIN:10, MAX:20, HEIGHT:0};
MEIRO.Models.M18341.POS = {DIST:15, ROT_X:1.571, ROT_Y:0};
MEIRO.Models.M18341.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M18341.prototype.onAnimate = function(time)
{
	this.time += this.speed;
	
	var t = rpm(this.time,8);

	this.sphere.position.y = 2*Math.sin(rpm(this.time,10));

	var v = this.lines.geometry.vertices;
	for (var i=0; i<this.n; i++ )
	{
		var j = 2*i;
		var q = 2*this.n-1-2*i;
		v[j].set(-10,1.5*Math.sin(this.offsets[j]),1.5*Math.cos(this.offsets[q]));
		j++;
		v[j].set(+10,v[j-1].y,v[j-1].z);

		var dv = new THREE.Vector3().subVectors(v[j],v[j-1]);
		var ps = new THREE.Vector3().subVectors(v[j-1],this.sphere.position);
		
		var A = dv.dot(dv),
			B = ps.dot(dv),
			C = ps.dot(ps)-3*3, // радиус 3
			D = B*B-A*C;

		if( D>=0 )
		{
			D = Math.sqrt(D);
			
			v[j-1].addScaledVector(dv,(-B+D)/A);
			
			var w = new THREE.Vector3().subVectors(v[j],v[j-1]);
			var n = new THREE.Vector3().subVectors(v[j-1],this.sphere.position);
			
			w.normalize();
			n.normalize();
			u = new THREE.Vector3().subVectors(n.multiplyScalar(2*n.dot(w)),w);
			this.refLines.geometry.vertices[j-1].copy(v[j-1]);
			this.refLines.geometry.vertices[j].copy(v[j-1]);
			this.refLines.geometry.vertices[j].addScaledVector(u,2);
		}
		else
		{
			this.refLines.geometry.vertices[j-1].y = 10000;
			this.refLines.geometry.vertices[j].y = 10000;
		}
	}
	this.lines.geometry.verticesNeedUpdate = true;
	this.refLines.geometry.verticesNeedUpdate = true;
	TWEEN.update();
	
	if (this.speed>0)
		reanimate();
}



// информатор на модела
MEIRO.Models.M18341.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Отражение на лъч от сфера</h1>';

	s += '<p>За намирането на отражение на лъч е нужно да се знаят два вектора &ndash; самият лъч като вектор и нормалният вектор към точката от повърхността, откъдето лъчът се отразява.</p>';
	
	element.innerHTML = s;
}


// превключвател на модела
MEIRO.Models.M18341.prototype.onToggle = function(element)
{
	var that = this;
	new TWEEN.Tween({k:this.speed})
		.to({k:this.speed>5?0:10},1500)
		.easing( TWEEN.Easing.Quadratic.InOut )
		.onUpdate( function(){
			that.speed = this.k;
		} )
		.start();
		
	reanimate();
}
	