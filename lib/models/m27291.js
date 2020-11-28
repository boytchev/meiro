
//	Основи на Компютърната Графика
//	Модел 27291 - Трансформации на текстурни координати
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M27291 = function M27291(room, model)
{
	MEIRO.Model.apply(this, arguments);

	var mapData = 'data:image/jpeg;base64,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';

	var map = new THREE.TextureLoader().load(mapData);
	map.anisotropy = 16;
	map.wrapT = THREE.RepeatWrapping;
	map.wrapS = THREE.RepeatWrapping;

	var map2 = new THREE.TextureLoader().load(mapData);
	map2.anisotropy = 16;
	map2.wrapT = THREE.RepeatWrapping;
	map2.wrapS = THREE.RepeatWrapping;

	var map3 = new THREE.TextureLoader().load(mapData);
	map3.anisotropy = 16;
	map3.wrapT = THREE.RepeatWrapping;
	map3.wrapS = THREE.RepeatWrapping;
	
	this.solid = [];

	// куб
	var material = new THREE.MeshLambertMaterial({map:map});
	this.solid.push( new THREE.Mesh(MEIRO.PRIMITIVE.GEOMETRY.CUBE, material) );
	this.solid[0].scale.set(3,3,3);
	
	// цилиндър
	var obj = new THREE.Group();
	map2.repeat.set(5,1);
	var material = new THREE.MeshLambertMaterial({map:map2});
	obj.add( new THREE.Mesh( new THREE.CylinderGeometry(1.5,1.5,Math.PI,32,1,true), material) );
	var material = new THREE.MeshLambertMaterial({map:map,polygonOffset:true,polygonOffsetFactor:1,polygonOffsetUnits:1});
	obj.add( new THREE.Mesh( new THREE.CylinderGeometry(1.5,1.5,Math.PI,32,1), material) );
	this.solid.push( obj );
	
	// сфера
	var material = new THREE.MeshLambertMaterial({map:map3});
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
	var material = new THREE.MeshPhongMaterial({map:map,shininess:100});
	var obj = new THREE.Group();
	for (var i=0; i<6; i++)
	{
		obj.add( new MEIRO.Bezier3D(3,12) );
		obj.children[i].material = material
	}
	this.solid.push( obj );

	
	// бутон за превключване
	var that = this;
	this.toggle = new MEIRO.CornerButton('topLeft', function(){that.onToggle();}, 'Обект', 'images/n123n.png');
	this.toggle.state = -1;
	this.toggle.hide();
	this.onToggle();
	
	for (var i=0; i<this.solid.length; i++)
		this.solid[i].position.y = -120;
	
	// сглобяване на целия модел
	for (var i=0; i<this.solid.length; i++)
		this.image.add(this.solid[i]);
}

MEIRO.Models.M27291.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M27291.DIST = {MIN:5, MAX:15, HEIGHT:0};
MEIRO.Models.M27291.POS = {DIST:10, ROT_X:0.3, ROT_Y:0.3};
MEIRO.Models.M27291.ROT_Y = {MIN:-0.3, MAX:0.7};



// аниматор на модела
MEIRO.Models.M27291.prototype.onAnimate = function(time)
{
	if (this.toggle.state<0) return;
	
	function transform(object,sizeU,sizeV)
	{
		object.material.map.rotation = rpm(time,3);
		object.material.map.repeat.set(
			sizeU[0]+sizeU[1]*Math.sin(rpm(time,7)),
			sizeV[0]+sizeV[1]*Math.cos(rpm(time,7)));
		object.material.map.offset.set(
			Math.sin(rpm(time,4)),
			Math.cos(rpm(time,5)));
	}

	switch (this.toggle.state)
	{
		case 0:
			transform(this.solid[0],[1.8,1.2],[1.8,1.2]);
			break;
		case 1:
			transform(this.solid[1].children[0],[6,0],[2,0]);
			transform(this.solid[1].children[1],[1.8,1.2],[1.8,1.2]);
			break;
		case 2:
			transform(this.solid[2],[6,0],[2,0]);
			break;
		case 3:
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

			for (var i=0; i<6; i++)
				transform(this.solid[3].children[i],[1.8,1.2],[1.8,1.2]);
			break;
	}
	
	TWEEN.update();
	reanimate();
}



// информатор на модела
MEIRO.Models.M27291.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Трансформации на текстурни координати</h1>';

	s += '<p>Текстурните координати в текстурното пространство могат да се транслират, мащабират и въртят. Тези трансформации се реализират чрез умножение на текстурните координати с матрица.</p>';

	element.innerHTML = s;
}




// превключвател на модела
MEIRO.Models.M27291.prototype.onToggle = function(element)
{
	var that = this;
	
	if (this.toggle.state>=0)
	{
		new TWEEN.Tween({y:0,i:this.toggle.state})
			.to({y:100,i:this.toggle.state},1000)
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
