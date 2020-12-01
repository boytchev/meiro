
//	Основи на Компютърната Графика
//	Модел 26351 - Пространство на Безие като преход между повърхнини
//	П. Бойчев, 2017


// конструктор на модела
MEIRO.Models.M26351 = function M26351(room)
{
	MEIRO.Model.apply(this, arguments);

	this.map = [];
	this.map.push( new THREE.TextureLoader().load('data:image/png;base64,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') );
	this.map.push( new THREE.TextureLoader().load('data:image/png;base64,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') );
	this.map[0].anisotropy = 16;
	this.map[1].anisotropy = 16;

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
	this.object = [];
	for (var i=0; i<6; i++)
	{
		this.object[i] = new MEIRO.Bezier3D(3,16);
		this.object[i].material = new THREE.MeshBasicMaterial({map:this.map[0],side:THREE.BackSide,transparent:true});
		this.object[i].renderOrder = 1;
	}
	
	this.object2 = [];
	for (var i=0; i<6; i++)
	{
		this.object2[i] = new MEIRO.Bezier3D(3,16);
		this.object2[i].material = new THREE.MeshBasicMaterial({map:this.map[0],side:THREE.FrontSide,transparent:true});
		this.object2[i].renderOrder = 2;
	}
	
	// бутон за превключване
	var that = this;
	this.toggle = new MEIRO.CornerButton('topLeft', function(){that.onToggle();}, 'Смяна', 'images/toggle.png');
	this.toggle.state = 0;
	this.toggle.hide();

	// сглобяване на целия модел
	for (var i=0; i<6; i++)
	{
		this.image.add(this.object[i]);
		this.image.add(this.object2[i]);
	}
}

MEIRO.Models.M26351.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M26351.DIST = {MIN:20, MAX:60, HEIGHT:0};
MEIRO.Models.M26351.POS = {DIST:30, ROT_X:1.4, ROT_Y:0.2};
MEIRO.Models.M26351.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M26351.prototype.onAnimate = function(time)
{	
	var n = 6;
	for (var i=0; i<3; i++)
	for (var j=0; j<3; j++)
	for (var k=0; k<3; k++)
		this.points[i][j][k].set(
			n*(i-1)+1*Math.cos(rpm(10+i+j+k,time)+i+j+k),
			n*(j-1)+2*Math.cos(rpm(15+i-j+k,time)+i+j-k),
			n*(k-1)+1*Math.sin(rpm(20-i+j-k,time)-i+j+k)
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
	this.object[5].surface.controlPoints[0][0].copy(this.points[2][2][0]);
	this.object[5].surface.controlPoints[1][0].copy(this.points[2][2][1]);
	this.object[5].surface.controlPoints[2][0].copy(this.points[2][2][2]);
	this.object[5].surface.controlPoints[0][1].copy(this.points[2][1][0]);
	this.object[5].surface.controlPoints[1][1].copy(this.points[2][1][1]);
	this.object[5].surface.controlPoints[2][1].copy(this.points[2][1][2]);
	this.object[5].surface.controlPoints[0][2].copy(this.points[2][0][0]);
	this.object[5].surface.controlPoints[1][2].copy(this.points[2][0][1]);
	this.object[5].surface.controlPoints[2][2].copy(this.points[2][0][2]);
	this.object[5].recalculate();

	// left
	this.object[4].surface.controlPoints[0][0].copy(this.points[0][0][0]);
	this.object[4].surface.controlPoints[1][0].copy(this.points[0][0][1]);
	this.object[4].surface.controlPoints[2][0].copy(this.points[0][0][2]);
	this.object[4].surface.controlPoints[0][1].copy(this.points[0][1][0]);
	this.object[4].surface.controlPoints[1][1].copy(this.points[0][1][1]);
	this.object[4].surface.controlPoints[2][1].copy(this.points[0][1][2]);
	this.object[4].surface.controlPoints[0][2].copy(this.points[0][2][0]);
	this.object[4].surface.controlPoints[1][2].copy(this.points[0][2][1]);
	this.object[4].surface.controlPoints[2][2].copy(this.points[0][2][2]);
	this.object[4].recalculate();
	
	// top
	this.object[3].surface.controlPoints[0][0].copy(this.points[0][2][2]);
	this.object[3].surface.controlPoints[1][0].copy(this.points[1][2][2]);
	this.object[3].surface.controlPoints[2][0].copy(this.points[2][2][2]);
	this.object[3].surface.controlPoints[0][1].copy(this.points[0][2][1]);
	this.object[3].surface.controlPoints[1][1].copy(this.points[1][2][1]);
	this.object[3].surface.controlPoints[2][1].copy(this.points[2][2][1]);
	this.object[3].surface.controlPoints[0][2].copy(this.points[0][2][0]);
	this.object[3].surface.controlPoints[1][2].copy(this.points[1][2][0]);
	this.object[3].surface.controlPoints[2][2].copy(this.points[2][2][0]);
	this.object[3].recalculate();
	
	// bottom
	this.object[2].surface.controlPoints[0][0].copy(this.points[0][0][0]);
	this.object[2].surface.controlPoints[1][0].copy(this.points[1][0][0]);
	this.object[2].surface.controlPoints[2][0].copy(this.points[2][0][0]);
	this.object[2].surface.controlPoints[0][1].copy(this.points[0][0][1]);
	this.object[2].surface.controlPoints[1][1].copy(this.points[1][0][1]);
	this.object[2].surface.controlPoints[2][1].copy(this.points[2][0][1]);
	this.object[2].surface.controlPoints[0][2].copy(this.points[0][0][2]);
	this.object[2].surface.controlPoints[1][2].copy(this.points[1][0][2]);
	this.object[2].surface.controlPoints[2][2].copy(this.points[2][0][2]);
	this.object[2].recalculate();
	
	// back
	this.object[1].surface.controlPoints[0][0].copy(this.points[0][0][2]);
	this.object[1].surface.controlPoints[1][0].copy(this.points[1][0][2]);
	this.object[1].surface.controlPoints[2][0].copy(this.points[2][0][2]);
	this.object[1].surface.controlPoints[0][1].copy(this.points[0][1][2]);
	this.object[1].surface.controlPoints[1][1].copy(this.points[1][1][2]);
	this.object[1].surface.controlPoints[2][1].copy(this.points[2][1][2]);
	this.object[1].surface.controlPoints[0][2].copy(this.points[0][2][2]);
	this.object[1].surface.controlPoints[1][2].copy(this.points[1][2][2]);
	this.object[1].surface.controlPoints[2][2].copy(this.points[2][2][2]);
	this.object[1].recalculate();
	
	// front
	this.object[0].surface.controlPoints[0][0].copy(this.points[0][2][0]);
	this.object[0].surface.controlPoints[1][0].copy(this.points[1][2][0]);
	this.object[0].surface.controlPoints[2][0].copy(this.points[2][2][0]);
	this.object[0].surface.controlPoints[0][1].copy(this.points[0][1][0]);
	this.object[0].surface.controlPoints[1][1].copy(this.points[1][1][0]);
	this.object[0].surface.controlPoints[2][1].copy(this.points[2][1][0]);
	this.object[0].surface.controlPoints[0][2].copy(this.points[0][0][0]);
	this.object[0].surface.controlPoints[1][2].copy(this.points[1][0][0]);
	this.object[0].surface.controlPoints[2][2].copy(this.points[2][0][0]);
	this.object[0].recalculate();

	for (var k=0; k<6; k++)
	{
		for (var i=0; i<3; i++)
		for (var j=0; j<3; j++)
			this.object2[k].surface.controlPoints[i][j].copy(this.object[k].surface.controlPoints[i][j]);
		this.object2[k].recalculate();
	}
	reanimate();
}



// информатор на модела
MEIRO.Models.M26351.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Пространство на Безие като преход между повърхнини</h1>';

	s += '<p>Пространството на Безие може да се разглежда като плавен преход от една повърхнина на Безие към друга. Преходът се контролира от една или повече междинни контролни повърхнини.</p>';
	
	element.innerHTML = s;
}


// превключвател на модела
MEIRO.Models.M26351.prototype.onToggle = function(element)
{
	this.toggle.state = 1-this.toggle.state;
	for (var i=0; i<4; i++)
	{
		this.object[i].material.map = this.map[this.toggle.state];
		this.object2[i].material.map = this.map[this.toggle.state];
	}
	reanimate();
}