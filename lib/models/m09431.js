
//	Основи на Компютърната Графика
//	Модел 09431 - Желан квадратен тор
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M09431 = function M09431(room)
{
	MEIRO.Model.apply(this, arguments);

	this.on = false;
	
	var m = 4; // брой върхове по периферията
	var n = 4; // брой върхове по напречното сечение
	var R = 3; // радиус на тора
	var r = 1.5; // радиус на напречното сечение
	
	// желан тор
	this.torus = new THREE.Object3D();
	for (var i=0; i<n; i++)
	{
		var a0 = (i+0.5)/n*2*Math.PI;
		var a1 = (i+1.5)/n*2*Math.PI;
		
		var r0 = R-r*Math.cos(a0);
		var r1 = R-r*Math.cos(a1);
		
		var h0 = r*Math.sin(a0);
		var h1 = r*Math.sin(a1);

		var material = new THREE.MeshLambertMaterial({color:'cornflowerblue',side:THREE.DoubleSide,transparent:true,opacity:1,polygonOffset:true,polygonOffsetFactor:-1});
		var geometry = new THREE.CylinderGeometry(r1,r0,h1-h0,m,1,true);
		geometry.translate(0,h0+(h1-h0)/2,0);
		if (h1<h0) geometry.scale(-1,1,1);
		
		this.torus.add( new THREE.Mesh(geometry,material) );
	}
	this.torus.rotation.y = Math.PI/4;
	
	// нежелан тор
	var s = Math.sqrt(2);
	this.notTorus = new THREE.Object3D();
	var side = new THREE.Mesh(
		new THREE.BoxGeometry(2*R/s,r*s,r),
		new THREE.MeshLambertMaterial({color:'tomato'}));
	side.position.set(r/2,0,R/s);
	this.notTorus.add(side);
	
	var side = new THREE.Mesh(
		new THREE.BoxGeometry(2*R/s,r*s,r),
		new THREE.MeshLambertMaterial({color:'yellow'}));
	side.position.set(-r/2,0,-R/s);
	this.notTorus.add(side);
	
	var side = new THREE.Mesh(
		new THREE.BoxGeometry(r,r*s,2*R/s),
		new THREE.MeshLambertMaterial({color:'mediumseagreen'}));
	side.position.set(-R/s,0,r/2);
	this.notTorus.add(side);
	
	var side = new THREE.Mesh(
		new THREE.BoxGeometry(r,r*s,2*R/s),
		new THREE.MeshLambertMaterial({color:'cornflowerblue'}));
	side.position.set(R/s,0,-r/2);
	this.notTorus.add(side);
	
	light = new THREE.PointLight('white',1);
	light.position.set(0,10,0);
	
	// бутон за превключване
	var that = this;
	this.toggle = new MEIRO.CornerButton('topLeft', function(){that.onToggle();}, 'НЕОТГОВОР', 'images/show.hide.png');
	this.toggle.hide();
	
	
	// сглобяване на целия модел
	this.image.add(this.torus,light,this.notTorus);
}

MEIRO.Models.M09431.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M09431.DIST = {MIN:10, MAX:20, HEIGHT:0};
MEIRO.Models.M09431.POS = {DIST:15, ROT_X:0, ROT_Y:0.6};
MEIRO.Models.M09431.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M09431.prototype.onAnimate = function(time)
{
	TWEEN.update();
}



// информатор на модела
MEIRO.Models.M09431.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Желан квадратен тор</h1>';

	s += '<p>Имаме тор, създаден от пресечени конуси. Как чрез промяна на параметрите да създадем квадратна версия на този тор?</p>';
	s += '<p>Подобен обект може да се конструира от паралелепипеди, но искаме да е видоизменен тор.</p>';
	
	element.innerHTML = s;
}



// превключвател на модела
MEIRO.Models.M09431.prototype.onToggle = function(element)
{
	var that = this;
	this.on = !this.on;
	new TWEEN.Tween({k:that.torus.children[0].material.opacity})
		.to({k: that.on?0:1},500)
		.easing( TWEEN.Easing.Quadratic.InOut )
		.onUpdate( function()
			{
				for (var i=0; i<4; i++)
					that.torus.children[i].material.opacity = this.k;
			})
		.start();
		
	reanimate();
}