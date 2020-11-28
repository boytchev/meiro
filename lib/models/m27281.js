
//	Основи на Компютърната Графика
//	Модел 27281 - Текстурни координати върху обекти
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M27281 = function M27281(room, model)
{
	MEIRO.Model.apply(this, arguments);

	var mapData = 'data:image/png;base64,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';
	var map = new THREE.TextureLoader().load(mapData);
	map.anisotropy = 16;
	var map2 = new THREE.TextureLoader().load(mapData);
	map2.anisotropy = 16;
	var map3 = new THREE.TextureLoader().load(mapData);
	map3.anisotropy = 16;
	
	this.solid = [];

	// куб
	var material = new THREE.MeshLambertMaterial({map:map});
	this.solid.push( new THREE.Mesh(MEIRO.PRIMITIVE.GEOMETRY.CUBE, material) );
	this.solid[0].scale.set(3,3,3);
	
	// цилиндър
	var obj = new THREE.Group();
	map2.wrapS = THREE.RepeatWrapping;
	map2.repeat.set(4,1);
	var material = new THREE.MeshLambertMaterial({map:map2});
	obj.add( new THREE.Mesh( new THREE.CylinderGeometry(2,2,Math.PI,32,1,true), material) );
	var material = new THREE.MeshLambertMaterial({map:map,polygonOffset:true,polygonOffsetFactor:1,polygonOffsetUnits:1});
	obj.add( new THREE.Mesh( new THREE.CylinderGeometry(2,2,Math.PI,32,1), material) );
	this.solid.push( obj );
	
	// сфера
	var material = new THREE.MeshLambertMaterial({map:map3});
	map3.wrapT = THREE.RepeatWrapping;
	map3.wrapS = THREE.RepeatWrapping;
	map3.repeat.set(4,2);
	this.solid.push( new THREE.Mesh(MEIRO.PRIMITIVE.GEOMETRY.SPHERE, material) );
	this.solid[2].scale.set(2,2,2);

	// деформиращ се куб
	this.points = [];
	for (var i=0; i<3; i++)
	{
		this.points[i] = [];
		for (var j=0; j<3; j++)
		{
			this.points[i][j] = [];
			for (var k=0; k<3; k++)
				this.points[i][j][k] = new THREE.Vector3();
		}
	}
	
	// пръстени, линии и блокове
	var material = new THREE.MeshLambertMaterial({map:map});
	var obj = new THREE.Group();
	for (var i=0; i<6; i++)
	{
		obj.add( new MEIRO.Bezier3D(3,12) );
		obj.children[i].material = material;
	}
	this.solid.push( obj );

	
	// бутон за превключване
	var that = this;
	this.toggle = new MEIRO.CornerButton('topLeft', function(){that.onToggle();}, 'Обект', 'images/n123n.png');
	this.toggle.state = -1;
	this.toggle.hide();
	this.onToggle();
	
	for (var i=0; i<this.solid.length; i++)
		this.solid[i].position.y = -20;
	
	// сглобяване на целия модел
	for (var i=0; i<this.solid.length; i++)
		this.image.add(this.solid[i]);
}

MEIRO.Models.M27281.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M27281.DIST = {MIN:5, MAX:15, HEIGHT:0};
MEIRO.Models.M27281.POS = {DIST:10, ROT_X:0.3, ROT_Y:0.3};
MEIRO.Models.M27281.ROT_Y = {MIN:-0.3, MAX:0.7};



// аниматор на модела
MEIRO.Models.M27281.prototype.onAnimate = function(time)
{
	if (this.toggle.state==3)
	{
		var n = 1.5;
		for (var i=0; i<3; i++)
		for (var j=0; j<3; j++)
		for (var k=0; k<3; k++)
			this.points[i][j][k].set(
				n*(i-1)+((i==1||j==1||k==1)?2:1)/3*Math.cos(rpm(10+i+j+k,time)+i+j+k),
				n*(j-1)+((i==1||j==1||k==1)?2:1)/3*Math.cos(rpm(15+i-j+k,time)+i+j-k),
				n*(k-1)+((i==1||j==1||k==1)?2:1)/3*Math.sin(rpm(20-i+j-k,time)-i+j+k)
			);
		
		//	   002-----202
		//	   /|      /|
		//	  / |     / |
		//	000-----200 |
		//   | 022---|-222
		//   | /     | /
		//   |/      |/
		//	020-----220
		
		// right
		this.solid[3].children[5].surface.controlPoints[0][0].copy(this.points[2][0][2]);
		this.solid[3].children[5].surface.controlPoints[1][0].copy(this.points[2][0][1]);
		this.solid[3].children[5].surface.controlPoints[2][0].copy(this.points[2][0][0]);
		this.solid[3].children[5].surface.controlPoints[0][1].copy(this.points[2][1][2]);
		this.solid[3].children[5].surface.controlPoints[1][1].copy(this.points[2][1][1]);
		this.solid[3].children[5].surface.controlPoints[2][1].copy(this.points[2][1][0]);
		this.solid[3].children[5].surface.controlPoints[0][2].copy(this.points[2][2][2]);
		this.solid[3].children[5].surface.controlPoints[1][2].copy(this.points[2][2][1]);
		this.solid[3].children[5].surface.controlPoints[2][2].copy(this.points[2][2][0]);
		this.solid[3].children[5].recalculate();

		// left
		this.solid[3].children[4].surface.controlPoints[0][0].copy(this.points[0][0][0]);
		this.solid[3].children[4].surface.controlPoints[1][0].copy(this.points[0][0][1]);
		this.solid[3].children[4].surface.controlPoints[2][0].copy(this.points[0][0][2]);
		this.solid[3].children[4].surface.controlPoints[0][1].copy(this.points[0][1][0]);
		this.solid[3].children[4].surface.controlPoints[1][1].copy(this.points[0][1][1]);
		this.solid[3].children[4].surface.controlPoints[2][1].copy(this.points[0][1][2]);
		this.solid[3].children[4].surface.controlPoints[0][2].copy(this.points[0][2][0]);
		this.solid[3].children[4].surface.controlPoints[1][2].copy(this.points[0][2][1]);
		this.solid[3].children[4].surface.controlPoints[2][2].copy(this.points[0][2][2]);
		this.solid[3].children[4].recalculate();
		
		// top
		this.solid[3].children[3].surface.controlPoints[0][0].copy(this.points[0][2][2]);
		this.solid[3].children[3].surface.controlPoints[1][0].copy(this.points[1][2][2]);
		this.solid[3].children[3].surface.controlPoints[2][0].copy(this.points[2][2][2]);
		this.solid[3].children[3].surface.controlPoints[0][1].copy(this.points[0][2][1]);
		this.solid[3].children[3].surface.controlPoints[1][1].copy(this.points[1][2][1]);
		this.solid[3].children[3].surface.controlPoints[2][1].copy(this.points[2][2][1]);
		this.solid[3].children[3].surface.controlPoints[0][2].copy(this.points[0][2][0]);
		this.solid[3].children[3].surface.controlPoints[1][2].copy(this.points[1][2][0]);
		this.solid[3].children[3].surface.controlPoints[2][2].copy(this.points[2][2][0]);
		this.solid[3].children[3].recalculate();
		
		// bottom
		this.solid[3].children[2].surface.controlPoints[0][0].copy(this.points[0][0][0]);
		this.solid[3].children[2].surface.controlPoints[1][0].copy(this.points[1][0][0]);
		this.solid[3].children[2].surface.controlPoints[2][0].copy(this.points[2][0][0]);
		this.solid[3].children[2].surface.controlPoints[0][1].copy(this.points[0][0][1]);
		this.solid[3].children[2].surface.controlPoints[1][1].copy(this.points[1][0][1]);
		this.solid[3].children[2].surface.controlPoints[2][1].copy(this.points[2][0][1]);
		this.solid[3].children[2].surface.controlPoints[0][2].copy(this.points[0][0][2]);
		this.solid[3].children[2].surface.controlPoints[1][2].copy(this.points[1][0][2]);
		this.solid[3].children[2].surface.controlPoints[2][2].copy(this.points[2][0][2]);
		this.solid[3].children[2].recalculate();
		
		// back
		this.solid[3].children[1].surface.controlPoints[0][0].copy(this.points[0][0][2]);
		this.solid[3].children[1].surface.controlPoints[1][0].copy(this.points[1][0][2]);
		this.solid[3].children[1].surface.controlPoints[2][0].copy(this.points[2][0][2]);
		this.solid[3].children[1].surface.controlPoints[0][1].copy(this.points[0][1][2]);
		this.solid[3].children[1].surface.controlPoints[1][1].copy(this.points[1][1][2]);
		this.solid[3].children[1].surface.controlPoints[2][1].copy(this.points[2][1][2]);
		this.solid[3].children[1].surface.controlPoints[0][2].copy(this.points[0][2][2]);
		this.solid[3].children[1].surface.controlPoints[1][2].copy(this.points[1][2][2]);
		this.solid[3].children[1].surface.controlPoints[2][2].copy(this.points[2][2][2]);
		this.solid[3].children[1].recalculate();
		
		// front
		this.solid[3].children[0].surface.controlPoints[0][2].copy(this.points[2][2][0]);
		this.solid[3].children[0].surface.controlPoints[1][2].copy(this.points[1][2][0]);
		this.solid[3].children[0].surface.controlPoints[2][2].copy(this.points[0][2][0]);
		this.solid[3].children[0].surface.controlPoints[0][1].copy(this.points[2][1][0]);
		this.solid[3].children[0].surface.controlPoints[1][1].copy(this.points[1][1][0]);
		this.solid[3].children[0].surface.controlPoints[2][1].copy(this.points[0][1][0]);
		this.solid[3].children[0].surface.controlPoints[0][0].copy(this.points[2][0][0]);
		this.solid[3].children[0].surface.controlPoints[1][0].copy(this.points[1][0][0]);
		this.solid[3].children[0].surface.controlPoints[2][0].copy(this.points[0][0][0]);
		this.solid[3].children[0].recalculate();
		
		reanimate();
	}
	
	TWEEN.update();
}



// информатор на модела
MEIRO.Models.M27281.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Текстурни координати върху обекти</h1>';

	s += '<p>При добавянето на текстура върху геометрични обекти се запазва формата на обектите. В резултат на това координатната система на текстурата може да се деформира, за да "приеме" съответната форма.</p>';

	element.innerHTML = s;
}




// превключвател на модела
MEIRO.Models.M27281.prototype.onToggle = function(element)
{
	var that = this;
	
	if (this.toggle.state>=0)
	{
		new TWEEN.Tween({y:0,i:this.toggle.state})
			.to({y:20,i:this.toggle.state},1000)
			.easing( TWEEN.Easing.Quadratic.InOut )
			.onUpdate( function(){
				that.solid[this.i].position.y = -this.y;
				reanimate();} )
			.start();
	}
	
	this.toggle.state = (this.toggle.state+1)%4;
	
	new TWEEN.Tween({y:40,i:this.toggle.state})
		.to({y:0,i:this.toggle.state},1000)
		.easing( TWEEN.Easing.Quadratic.InOut )
		.onUpdate( function(){
			that.solid[this.i].position.y = -this.y;
			reanimate();} )
		.start();
	reanimate();
}
