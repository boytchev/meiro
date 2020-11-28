
//	Основи на Компютърната Графика
//	Модел 15201 - Формула на Ойлер за додекаедър
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M15201 = function M15201(room, model)
{
	MEIRO.Model.apply(this, arguments);

	this.kTarget = 0;
	this.k = 0;
	
	//1.000
	//1.618
	//0.618
	var f = (1+Math.sqrt(5))/2;
	// додекаедър
	this.solid = new MEIRO.Graph( 1.3,
		[ 1,1,1, -1,1,1, 1,-1,1, -1,-1,1, 1,1,-1, -1,1,-1, 1,-1,-1, -1,-1,-1,
		  0,f,1/f, 0,-f,1/f, 0,f,-1/f, 0,-f,-1/f,
		  1/f,0,f, -1/f,0,f, 1/f,0,-f, -1/f,0,-f,
		  f,1/f,0, -f,1/f,0, f,-1/f,0, -f,-1/f,0],
		[0, 8, 0, 12, 0, 16, 1, 8, 1, 13, 1, 17, 2, 9, 2, 12, 2, 18, 3, 9, 3, 13, 3, 19, 4, 10, 4, 14, 4, 16, 5, 10, 5, 15, 5, 17, 6, 11, 6, 14, 6, 18, 7, 11, 7, 15, 7, 19, 8, 10, 9, 11, 12, 13, 14, 15, 16, 18, 17, 19]
	);
	
	// запомняне на позиции на върхове
	this.posA = [];
	this.posB = [];
	this.lookAtA = [];
	this.lookAtB = [];
	var v = new THREE.Vector3();
	for (var i=0; i<20; i++)
	{
		var x = (Math.floor(i/2)-4.5)/2;
		var z = (i%2-0.5);
		this.posA.push(this.solid.vertex[i].position.clone());
		this.posB.push(new THREE.Vector3(x,2/3,z));
		this.lookAtA.push(v);
		this.lookAtB.push(v);
	}
	for (var i=0; i<30; i++)
	{
		this.posA.push(this.solid.edge[i].position.clone());
		var x = (Math.floor(i/3)-4.5)/2;
		var z = (i%3-1)/3;
		this.posB.push(new THREE.Vector3(x,-2/3,z));
		this.lookAtA.push(this.solid.edge[i].lookAtPos);
		this.lookAtB.push(new THREE.Vector3(x,0,z));
	}
	
	// бутон за превключване
	var that = this;
	this.toggle = new MEIRO.CornerButton('topLeft', function(){that.onToggle();}, 'ВИЖ', 'images/show.hide.png');
	this.toggle.hide();
	
	// сглобяване на целия модел
	this.image.add(this.solid);
}

MEIRO.Models.M15201.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M15201.DIST = {MIN:5, MAX:15, HEIGHT:0};
MEIRO.Models.M15201.POS = {DIST:10, ROT_X:-0.9, ROT_Y:0};
MEIRO.Models.M15201.ROT_Y = {MIN:-0.1, MAX:0.1};



// аниматор на модела
MEIRO.Models.M15201.prototype.onAnimate = function(time)
{
	TWEEN.update();
}



// информатор на модела
MEIRO.Models.M15201.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Формула на Ойлер за додекаедър</h1>';

	s += '<p>Додекаедърът има <em>V = 20</em> върха, <em>E = 30</em> ръба и <em>F = 12</em> стени. Формулата на Ойлер <em>V-E+F = 2</em> е вярна: <em>20-30+12 = 2</em>.</p>';

	element.innerHTML = s;
}




// превключвател на модела
MEIRO.Models.M15201.prototype.onToggle = function(element)
{
	this.kTarget = 1-this.kTarget;

	var that = this;
	new TWEEN.Tween({k:this.k})
		.to({k:this.kTarget},1500)
		.easing( TWEEN.Easing.Quadratic.InOut )
		.onUpdate( function(){
			that.k = this.k;
			var k = Math.pow(this.k,5);
			var v = new THREE.Vector3();
			for (var i=0; i<20+30; i++)
			{
				that.solid.children[i].position.lerpVectors(that.posA[i],that.posB[i],that.k);
				if (i>=20)
				{
					v.lerpVectors(that.lookAtA[i],that.lookAtB[i],k);
					that.solid.children[i].lookAt(v);
				}
			}
		} )
		.start();
	reanimate();
}
