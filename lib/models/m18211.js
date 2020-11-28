
//	Основи на Компютърната Графика
//	Модел 18211 - Сечение на права със сфера
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M18211 = function M18211(room)
{
	MEIRO.Model.apply(this, arguments);

	this.time = 0;
	this.speed = 0;

	this.n = 30;
	var geosphere = new THREE.IcosahedronGeometry(0.1,options.lowpoly?0:1);
	this.spheres = [];
	style = new THREE.MeshLambertMaterial({color:'black'});
	for (var i=0; i<2*this.n; i++)
	{
		this.spheres.push (new THREE.Mesh(geosphere,style));
	}
	
	// равнина
	this.sphere = new MEIRO.Sphere(3);
	this.sphere.material = MEIRO.PRIMITIVE.STYLE.PLATE.clone();
	this.sphere.material.opacity = 0.5;
	this.sphere.material.depthTest = true;
	this.sphere.material.side = THREE.FrontSide;
	
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
	this.lines = new THREE.LineSegments(linesGeometry,new THREE.LineBasicMaterial({color:'gold',transparent:!true,opacity:0.5}));
	
	// бутон за превключване
	var that = this;
	this.toggle = new MEIRO.CornerButton('topLeft', function(){that.onToggle();}, 'СТАРТ', 'images/start.stop.png');
	this.toggle.hide();

	// сглобяване на целия модел
	this.image.add(this.lines, this.sphere);
	for (var i=0; i<2*this.n; i++)
		this.image.add(this.spheres[i]);
}

MEIRO.Models.M18211.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M18211.DIST = {MIN:10, MAX:20, HEIGHT:0};
MEIRO.Models.M18211.POS = {DIST:15, ROT_X:1.571, ROT_Y:0};
MEIRO.Models.M18211.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M18211.prototype.onAnimate = function(time)
{
	this.time += this.speed;
	
	var t = rpm(this.time,8);

	this.sphere.position.y = 2*Math.sin(rpm(this.time,10));

	var v = this.lines.geometry.vertices;
	for (var i=0; i<this.n; i++ )
	{
		var j = 2*i;
		var q = 2*this.n-1-2*i;
		v[j].set(-10,3.5*Math.sin(rpm(this.time,this.speeds[j])+this.offsets[j]),3.5*Math.cos(rpm(this.time,this.speeds[q])-this.offsets[q]));
		j++;
		v[j].set(+10,3.5*Math.sin(rpm(this.time,this.speeds[j])+this.offsets[j]),3.5*Math.cos(rpm(this.time,this.speeds[q])-this.offsets[q]));

		var dv = new THREE.Vector3().subVectors(v[j],v[j-1]);
		var ps = new THREE.Vector3().subVectors(v[j-1],this.sphere.position);
		
		var A = dv.dot(dv),
			B = ps.dot(dv),
			C = ps.dot(ps)-3*3, // радиус 3
			D = B*B-A*C;

		if( D>=0 )
		{
			D = Math.sqrt(D);
			
			this.spheres[j].visible = true;
			this.spheres[j].position.copy(v[j-1]);
			this.spheres[j].position.addScaledVector(dv,(-B+D)/A);

			this.spheres[j-1].visible = true;
			this.spheres[j-1].position.copy(v[j-1]);
			this.spheres[j-1].position.addScaledVector(dv,(-B-D)/A);
		}
		else
		{
			this.spheres[j].visible = false;
			this.spheres[j-1].visible = false;
		}
/*		
		var k = -(wx*v[j].x+wy*v[j].y+wz*v[j].z+ww)/(wx*dv.x+wy*dv.y+wz*dv.z);

		dv.multiplyScalar(k).add(v[j]);
		this.spheres[i].position.copy(dv);
*/	
	}
	this.lines.geometry.verticesNeedUpdate = true;
	TWEEN.update();
	
	if (this.speed>0)
		reanimate();
}



// информатор на модела
MEIRO.Models.M18211.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Сечение на права със сфера</h1>';

	s += '<p>Изчисляването на координатите на сеченията се свеждат до решаване на квадратни уравнения. Затова всяка права може да сече сферата в 0, 1 или 2 точки.</p>';
	
	element.innerHTML = s;
}


// превключвател на модела
MEIRO.Models.M18211.prototype.onToggle = function(element)
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
	