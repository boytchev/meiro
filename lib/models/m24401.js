
//	Основи на Компютърната Графика
//	Модел 24401 - Подразделяне на Лууп
//	П. Бойчев, 2017


// конструктор на модела
MEIRO.Models.M24401 = function M24401(room)
{
	MEIRO.Model.apply(this, arguments);

	this.n = 5; // брой подразделяния
	
	var geometry = new THREE.Geometry();
	geometry.vertices.push(
		/*0*/ new THREE.Vector3(12,-3,2),	//0
		/*1*/ new THREE.Vector3(12,3,2),	//1
		/*2*/ new THREE.Vector3(12,3,-2),	//2
		/*3*/ new THREE.Vector3(12,-3,-2),	//3
		/*4*/ new THREE.Vector3(6,0,1),	//4
		/*5*/ new THREE.Vector3(6,0,1),	//5
		/*6*/ new THREE.Vector3(6,0,-1),	//6
		/*7*/ new THREE.Vector3(6,0,-1),	//7
		/*8*/ new THREE.Vector3(2,-1,1.5),	//8
		/*9*/ new THREE.Vector3(2,1,1.5),	//9
		/*10*/ new THREE.Vector3(2,1,-1.5),	//10
		/*11*/ new THREE.Vector3(2,-1,-1.5),//11
		/*12*/ new THREE.Vector3(0,1.5,1),	//12
		/*13*/ new THREE.Vector3(0,4.5,1),	//13
		/*14*/ new THREE.Vector3(0,4.5,-1),	//14
		/*15*/ new THREE.Vector3(0,1.5,-1),	//15
		/*16*/ new THREE.Vector3(0,-4.5,1),	//16
		/*17*/ new THREE.Vector3(0,-1.5,1),	//17
		/*18*/ new THREE.Vector3(0,-1.5,-1),//18
		/*19*/ new THREE.Vector3(0,-4.5,-1),//19
		/*20*/ new THREE.Vector3(-2,-1,1.5),//20
		/*21*/ new THREE.Vector3(-2,1,1.5),	//21
		/*22*/ new THREE.Vector3(-2,1,-1.5),//22
		/*23*/ new THREE.Vector3(-2,-1,-1.5),//23
		/*24*/ new THREE.Vector3(-6,0,1),	//24
		/*25*/ new THREE.Vector3(-6,0,1),	//25
		/*26*/ new THREE.Vector3(-6,0,-1),	//26
		/*27*/ new THREE.Vector3(-6,0,-1),	//27
		/*28*/ new THREE.Vector3(-12,-3,2),	//28
		/*29*/ new THREE.Vector3(-12,3,2),	//29
		/*30*/ new THREE.Vector3(-12,3,-2),	//30
		/*31*/ new THREE.Vector3(-12,-3,-2),//31
		/*32*/ new THREE.Vector3(12,-10,10),//32
		/*33*/ new THREE.Vector3(12,10,10),	//33
		/*34*/ new THREE.Vector3(12,10,-10),//34
		/*35*/ new THREE.Vector3(12,-10,-10),	//35
		/*36*/ new THREE.Vector3(-12,-10,10),	//36
		/*37*/ new THREE.Vector3(-12,10,10),	//37
		/*38*/ new THREE.Vector3(-12,10,-10),	//38
		/*39*/ new THREE.Vector3(-12,-10,-10),	//39
		/*40*/ new THREE.Vector3(0.5,-0.5,10),	//40
		/*41*/ new THREE.Vector3(0.5,0.5,10),	//41
		/*42*/ new THREE.Vector3(-0.5,0.5,10),	//42
		/*43*/ new THREE.Vector3(-0.5,-0.5,10),	//43
		/*44*/ new THREE.Vector3(0.5,-0.5,-10),	//44
		/*45*/ new THREE.Vector3(0.5,0.5,-10),	//45
		/*46*/ new THREE.Vector3(-0.5,0.5,-10),	//46
		/*47*/ new THREE.Vector3(-0.5,-0.5,-10),//47
	);
	function face(a,b,c,d)
	{
		geometry.faces.push(
			new THREE.Face3(a,b,c),
			new THREE.Face3(a,c,d)
		);
	}
	face( 5,1,0,4);
	face( 6,2, 1, 5);
	face( 7,3, 2, 6);
	face( 4,0, 3, 7);
	face( 9,5, 4, 8);
	face( 11,7, 6, 10);
	face( 13,5, 9, 12);
	face( 14,6, 5, 13);
	face( 15,10, 6, 14);
	face( 12,9, 10, 15);
	face( 17,8, 4, 16);
	face( 18,11, 8, 17);
	face( 19,7, 11, 18);
	face( 16,4, 7, 19);
	face( 10,9, 8, 11);
	face( 23,20, 21, 22);
	face( 20,17, 16, 24);
	face( 23,18, 17, 20);
	face( 27,19, 18, 23);
	face( 24, 16, 19, 27);
	face( 25, 13, 12, 21);
	face( 26, 14, 13, 25);
	face( 22, 15, 14, 26);
	face( 21, 12, 15, 22);
	face( 25, 21, 20, 24);
	face( 27, 23, 22, 26);
	face( 29, 25, 24, 28);
	face( 30, 26, 25, 29);
	face( 31, 27, 26, 30);
	face( 28, 24, 27, 31);

	face( 37, 29, 28, 36);
	face( 38, 30, 29, 37);
	face( 39, 31, 30, 38);
	face( 36, 28, 31, 39);
	face( 32, 0, 1, 33);
	face( 33, 1, 2, 34);
	face( 34, 2, 3, 35);
	face( 35, 3, 0, 32);
	face( 33, 34, 38, 37);
	face( 35, 32, 36, 39);

	face( 40, 32, 33, 41);
	face( 43, 36, 32, 40);
	face( 42, 37, 36, 43);
	face( 41, 33, 37, 42);
	face( 47, 43, 40, 44);
	face( 46, 42, 43, 47);
	face( 45, 41, 42, 46);
	face( 44, 40, 41, 45);
	face( 35, 44, 45, 34);
	face( 34, 45, 46, 38);
	face( 38, 46, 47, 39);
	face( 39, 47, 44, 35);
	
	var objectMaterial = new THREE.MeshPhongMaterial({color:'darkorange',shininess:100,polygonOffset:true,polygonOffsetFactor:1,polygonOffsetUnits:0.1,side:THREE.DoubleSide});
	var frameMaterial = new THREE.MeshBasicMaterial({color:'black',depthWrite:false,wireframe:true,transparent:true,opacity:0.2});
	
	this.object = [];
	this.frame = [];
	for (var i=0; i<this.n; i++)
	{
		var modifier = new THREE.SubdivisionModifier( i );
		var geom = geometry.clone();
		modifier.modify(geom);
		geom.computeFaceNormals();
		this.object.push( new THREE.Mesh(geom,objectMaterial) );
		this.frame.push( new THREE.Mesh(geom,frameMaterial) );
		this.object[i].visible = false;
		this.frame[i].visible = false;
	}
	
	this.showLevel = this.n-1;
	this.showStyle = 0;
	
	// бутон за превключване
	var that = this;
	this.toggle = new MEIRO.CornerButton('topLeft', function(){that.onToggle();}, 'Подразделяния', 'images/multiply.png');
	this.toggle.hide();
	this.onToggle();

	this.showHide = new MEIRO.CornerButton('topRight', function(){that.onShowHide();}, 'Покажи', 'images/show.hide.png');
	this.showHide.hide();
	
	this.light = new THREE.AmbientLight('white',0.25);
	
	// сглобяване на целия модел
	this.image.add(this.light);
	for (var i=0; i<this.n; i++)
		this.image.add(this.object[i],this.frame[i]);
}

MEIRO.Models.M24401.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M24401.DIST = {MIN:5, MAX:60, HEIGHT:0};
MEIRO.Models.M24401.POS = {DIST:40, ROT_X:Math.PI/2, ROT_Y:0};
MEIRO.Models.M24401.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M24401.prototype.onAnimate = function(time)
{
	//TWEEN.update();
	
	//reanimate();
}



// информатор на модела
MEIRO.Models.M24401.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Подразделяне на Лууп</h1>';

	s += '<p>Подразделянето на Лууп е метод, с който се заглажда триъгълна мрежа. На всеки триъгълник се създават три нови върха по страните му. Те се свързват в нова триъгълна стена. Така всеки триъгълник се заменя от четири по-малки триъгълника.</p>';
	element.innerHTML = s;
}


// превключвател на модела
MEIRO.Models.M24401.prototype.onToggle = function(element)
{
	this.object[this.showLevel].visible = false;
	this.frame[this.showLevel].visible = false;
	
	this.showLevel = (this.showLevel+1)%this.n;

	this.object[this.showLevel].visible = this.showStyle>0;
	this.frame[this.showLevel].visible = this.showStyle<2;
	
	reanimate();
}



// превключвател на модела
MEIRO.Models.M24401.prototype.onShowHide = function(element)
{
	this.showStyle = (this.showStyle+1)%3;

	this.object[this.showLevel].visible = this.showStyle>0;
	this.frame[this.showLevel].visible = this.showStyle<2;
	
	reanimate();
}