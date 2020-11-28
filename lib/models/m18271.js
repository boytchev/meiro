
//	Основи на Компютърната Графика
//	Модел 18271 - Двоично търсене за форма на сърце
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M18271 = function M18271(room)
{
	MEIRO.Model.apply(this, arguments);

	this.pos = 0;

	var geometry = new THREE.IcosahedronGeometry(0.7,options.lowpoly?2:4);
	this.from = [];
	this.to = [];
	for (var i=0; i<geometry.vertices.length; i++ )
	{
		var v = geometry.vertices[i];
		this.from[i] = new THREE.Vector3().copy(v);
		this.to[i] = new THREE.Vector3().copy(v);
	}
	style = new THREE.MeshPhongMaterial({color:'red',shininess:100/*,shading:THREE.FlatShading*/});
	this.object = new THREE.Mesh(geometry,style);
	
	function shape(p)
	{
		var y =p.y+0.2;
		return Math.pow(2*p.x*p.x+y*y+p.z*p.z-1,3)-y*y*y*(p.x*p.x/10+p.z*p.z);
	}
	
	var w= new THREE.Vector3();
	for (var i=0; i<this.to.length; i++ )
	{
		var v = this.to[i];
		var m1 = 0.001,
			m2 = 15, 
			m = (m1+m2)/2;
			
		while (m2-m1>0.0001)
		{
			w.copy(v).multiplyScalar(m);
			if( shape(w)>0 )
				m2 = m;
			else
				m1 = m;
			m = (m1+m2)/2;
		}
		v.copy(w);
	}
	
	// бутон за превключване
	var that = this;
	this.toggle = new MEIRO.CornerButton('topLeft', function(){that.onToggle();}, 'ВИЖ', 'images/show.hide.png');
	this.toggle.hide();

	// сглобяване на целия модел
	this.image.add(this.object);
}

MEIRO.Models.M18271.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M18271.DIST = {MIN:1, MAX:6, HEIGHT:0};
MEIRO.Models.M18271.POS = {DIST:3, ROT_X:0, ROT_Y:0.3};
MEIRO.Models.M18271.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M18271.prototype.onAnimate = function(time)
{
	var vs = this.object.geometry.vertices;
	for (var i=0; i<vs.length; i++ )
	{
		var v = vs[i];
		v.lerpVectors(this.from[i],this.to[i],this.pos);
	}
	this.object.geometry.verticesNeedUpdate = true;
	this.object.geometry.computeVertexNormals();
	
	TWEEN.update();
	
	if (0.02<this.pos && this.pos<0.98)
		reanimate();
}



// информатор на модела
MEIRO.Models.M18271.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Двоично търсене за форма на сърце</h1>';

	s += '<p>Повърхността на сърцето има уравнение <em>(2x² + y² + z²&ndash;1)³ &ndash; x²y³/10 &ndash; y³z² = 0</em>. Точките по пвърхността се изчисляват, като се спускат лъчи в различни посоки и чрез двоично търсене се намира пресечната точка с повърхността. Използва се факта, че всички вътрешни точки имат един и същ знак при заместване в уравнението, а всички външни имат обратния знак.</p>';
	
	element.innerHTML = s;
}


// превключвател на модела
MEIRO.Models.M18271.prototype.onToggle = function(element)
{
	var that = this;
	new TWEEN.Tween({k:this.pos})
		.to({k:this.pos>0.5?0:1},500)
		.easing( TWEEN.Easing.Quadratic.InOut )
		.onUpdate( function(){
			that.pos = this.k;
		} )
		.start();
		
	reanimate();
}
	