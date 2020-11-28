
//	Основи на Компютърната Графика
//	Модел 15201 - Формула на Ойлер за октаедър
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M15201 = function M15201(room, model)
{
	MEIRO.Model.apply(this, arguments);

	this.kTarget = 0;
	this.k = 0;
	
	// октаедър
	this.solid = new MEIRO.Graph( 3,
		[0.5, 0, 0.5, 0.5, 0, -0.5, -0.5, 0, -0.5, -0.5, 0, 0.5, 0, 0.7071, 0, 0, -0.7071, 0],
		[5, 0, 5, 1, 5, 2, 5, 3, 4, 0, 4, 1, 4, 2, 4, 3, 0, 1, 1, 2, 2, 3, 3, 0]
	);
	
	// запомняне на позиции на върхове
	this.posA = [];
	this.posB = [];
	this.lookAtA = [];
	this.lookAtB = [];
	var v = new THREE.Vector3();
	for (var i=0; i<6; i++)
	{
		this.posA.push(this.solid.vertex[i].position.clone());
		this.posB.push(new THREE.Vector3(i-2.5,1,0));
		this.lookAtA.push(v);
		this.lookAtB.push(v);
	}
	for (var i=0; i<12; i++)
	{
		this.posA.push(this.solid.edge[i].position.clone());
		var x = (i>>1)-2.5;
		var z = (i%2-0.5)/3;
		this.posB.push(new THREE.Vector3(x,-1,z));
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
	s += '<h1>Формула на Ойлер за октаедър</h1>';

	s += '<p>Октаедърът има <em>V = 6</em> върха, <em>E = 12</em> ръба и <em>F = 8</em> стени. Формулата на Ойлер <em>V-E+F = 2</em> е вярна: <em>6-12+8 = 2</em>.</p>';

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
			for (var i=0; i<6+12; i++)
			{
				that.solid.children[i].position.lerpVectors(that.posA[i],that.posB[i],that.k);
				if (i>=6)
				{
					v.lerpVectors(that.lookAtA[i],that.lookAtB[i],k);
					that.solid.children[i].lookAt(v);
				}
			}
		} )
		.start();
	reanimate();
}
