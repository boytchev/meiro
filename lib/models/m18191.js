
//	Основи на Компютърната Графика
//	Модел 18191 - Сечение на права с равнина
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M18191 = function M18191(room)
{
	MEIRO.Model.apply(this, arguments);

	this.time = 0;
	this.speed = 0;

	this.n = 50;
	var geosphere = new THREE.IcosahedronGeometry(0.1,options.lowpoly?0:1);
	this.spheres = [];
	var style = new THREE.MeshLambertMaterial({color:'black'});
	for (var i=0; i<this.n; i++)
	{
		this.spheres.push (new THREE.Mesh(geosphere,style));
		
	}
	
	// равнина
	this.points = [new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3()];
	this.disk = new THREE.Mesh(
		new THREE.CircleGeometry(7,options.lowpoly?24:48),
		MEIRO.PRIMITIVE.STYLE.PLATE.clone()
	);
	this.disk.material.opacity = 0.5;
	this.disk.material.depthTest = true;
	this.disk.up = (new THREE.Vector3(0,1,0));
	
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
	this.image.add(this.lines, this.disk);
	for (var i=0; i<this.n; i++)
		this.image.add(this.spheres[i]);
}

MEIRO.Models.M18191.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M18191.DIST = {MIN:10, MAX:20, HEIGHT:0};
MEIRO.Models.M18191.POS = {DIST:15, ROT_X:1.571, ROT_Y:0};
MEIRO.Models.M18191.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M18191.prototype.onAnimate = function(time)
{
	this.time += this.speed;
	
	var v1 = this.points[0];
	var v2 = this.points[1];
	var v3 = this.points[2];
	
	var t = rpm(this.time,8);
	v1.set(3*Math.sin(rpm(this.time,17)+0.6), 4*Math.cos(t), 4*Math.sin(t));
	t += Math.PI*2/3;
	v2.set(3*Math.cos(rpm(this.time,13)+0.3), 4*Math.cos(t), 4*Math.sin(t));
	t += Math.PI*2/3;
	v3.set(3*Math.sin(rpm(this.time,15)+1.1), 4*Math.cos(t), 4*Math.sin(t));

	this.disk.position.copy(v1);
	this.disk.position.multiplyScalar(1/3);
	this.disk.position.addScaledVector(v2,1/3);
	this.disk.position.addScaledVector(v3,1/3);

	var p = v2.clone().sub(v1);
	var q = v3.clone().sub(v1);
	this.disk.lookAt(p.cross(q));
	
	var wx = v1.y*( v2.z-v3.z )+v2.y*( v3.z-v1.z )+v3.y*( v1.z-v2.z ),
		wy = v1.z*( v2.x-v3.x )+v2.z*( v3.x-v1.x )+v3.z*( v1.x-v2.x ),
		wz = v1.x*( v2.y-v3.y )+v2.x*( v3.y-v1.y )+v3.x*( v1.y-v2.y ),
		ww = -( v1.x*( v2.y*v3.z-v3.y*v2.z )+v2.x*( v3.y*v1.z-v1.y*v3.z )+v3.x*( v1.y*v2.z-v2.y*v1.z ) );

	var v = this.lines.geometry.vertices;
	for (var i=0; i<this.n; i++ )
	{
		var j = 2*i;
		var q = 2*this.n-1-2*i;
		v[j].set(-10,3.5*Math.sin(rpm(this.time,this.speeds[j])+this.offsets[j]),3.5*Math.cos(rpm(this.time,this.speeds[q])-this.offsets[q]));
		j++;
		v[j].set(+10,3.5*Math.sin(rpm(this.time,this.speeds[j])+this.offsets[j]),3.5*Math.cos(rpm(this.time,this.speeds[q])-this.offsets[q]));
		
		var dv = new THREE.Vector3().subVectors(v[j-1],v[j]);
		var k = -(wx*v[j].x+wy*v[j].y+wz*v[j].z+ww)/(wx*dv.x+wy*dv.y+wz*dv.z);

		dv.multiplyScalar(k).add(v[j]);
		this.spheres[i].position.copy(dv);
	}
	this.lines.geometry.verticesNeedUpdate = true;
	
	TWEEN.update();
	
	if (this.speed>0)
		reanimate();
}



// информатор на модела
MEIRO.Models.M18191.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Сечение на права с равнина</h1>';

	s += '<p>Сеченията на правите с равнината са отбелязани със сфери. Координатите им се изчисляват на базата на уравнението на равнината и вектори по правите.</p>';
	
	element.innerHTML = s;
}


// превключвател на модела
MEIRO.Models.M18191.prototype.onToggle = function(element)
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
	