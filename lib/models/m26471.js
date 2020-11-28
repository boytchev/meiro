
//	Основи на Компютърната Графика
//	Модел 26471 - Кожа от повърхнини с подразделяне
//	П. Бойчев, 2017


// конструктор на модела
MEIRO.Models.M26471 = function M26471(room)
{
	MEIRO.Model.apply(this, arguments);

	this.object = new THREE.Mesh( new THREE.Geometry() );
	this.frame = new THREE.Mesh( new THREE.Geometry() );
	
	this.material = new THREE.MeshBasicMaterial({color:'red',transparent:true,opacity:0.7,depthTest:false});
	this.lines = [];
	for (var i=0; i<25; i++)
	{
		this.lines.push(new MEIRO.Cylinder(0.02,1));
		this.lines[i].material = this.material;
		this.lines[i].matrixAutoUpdate = false;
		this.lines[i].renderOrder = 10;
	}
	
	// бутон за превключване
	var that = this;
	this.k = 0;
	this.showHide = new MEIRO.CornerButton('topLeft', function(){that.onShowHide();}, 'Покажи скелет', 'images/show.hide.png');
	this.showHide.hide();
	
	this.light = new THREE.AmbientLight('white',0.5);
	
	// сглобяване на целия модел
	this.image.add(this.light,this.object,this.frame);
	for (var i=0; i<25; i++)
		this.image.add(this.lines[i]);
}

MEIRO.Models.M26471.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M26471.DIST = {MIN:50, MAX:160, HEIGHT:0};
MEIRO.Models.M26471.POS = {DIST:80, ROT_X:Math.PI/2, ROT_Y:0};
MEIRO.Models.M26471.ROT_Y = {MIN:-0.1, MAX:0.7};


// генератор на човече
MEIRO.Models.M26471.prototype.generateFigure = function(time)
{
	var geometry = new THREE.Geometry();
	
	function fl(gof,gol)
	{
		var p = turtle.basis.clone();
		turtle.fd(gof);
		turtle.sl(gol);
		var res = turtle.getPosition();
		turtle.basis.copy(p);
		return res;
	}
	
	function fla(i,gof1,gof2,gol)
	{
		geometry.vertices[i+0] = ( fl(gof1,gol) );
		geometry.vertices[i+1] = ( fl(gof1,-gol) );
		geometry.vertices[i+2] = ( fl(gof2,-gol) );
		geometry.vertices[i+3] = ( fl(gof2,gol) );
	}
	
	function flb(i,gof1,gof2,gol)
	{
		geometry.vertices[i+0] = ( fl(gof1,gol) );
		geometry.vertices[i+1] = ( fl(gof2,gol) );
		geometry.vertices[i+2] = ( fl(gof2,-gol) );
		geometry.vertices[i+3] = ( fl(gof1,-gol) );
	}

	function flc(i,gof1,gof2,gol)
	{
		geometry.vertices[i+0] = ( fl(gof1,gol) );
		geometry.vertices[i+1] = ( fl(gof2,gol) );
	}

	function face(a,b,c,d)
	{
		var f1 = new THREE.Face3(a,b,c);
		var f2 = new THREE.Face3(a,c,d);
		geometry.faces.push(f1,f2);
	}
	var Ls = [0,8,4,3,10,8,5,4,4,3,4,7,7,0,0,2,8,2];
	var t = time/1000;
	var q = t/2;
	
	var qq=1;
	var SP1 = qq*60*Math.sin( 3*q );
	var SP2 = qq*20*Math.cos( 4*q );
	var SP3 = qq*80*Math.sin( 5*q );
	var SP4 = qq*30*Math.cos( 2*q );
	var SP5 = qq*30*Math.cos( 1*q );

	var SP6 = qq*30*Math.sin( 4*q );
	var SP7 = 30+qq*40*Math.sin( 1*q );
	var SP8 = 40+qq*40*Math.sin( 2*q );
	var SP9 = qq*40*Math.sin( 3*q );
	var SP10 = qq*40*Math.sin( 6*q );

	var SP6x = qq*30*Math.cos( 4*q );
	var SP7x = 30+qq*40*Math.sin( 1*q );
	var SP8x = 40+qq*40*Math.cos( 2*q );
	var SP9x = qq*40*Math.sin( 3*q );
	var SP10x = qq*40*Math.cos( 6*q );

	var SPL11 = -45-qq*25*Math.sin( 3*q );
	var SPL12 = 20+qq*30*Math.cos( 2*q );
	var SPL13 = 0;

	var SPR11 = -45-qq*25*Math.cos( 2*q );
	var SPR12 = 20+qq*30*Math.cos( 3*q );
	var SPR13 = 0;

	var SPL14 = 25+qq*25*Math.cos( 5*q );
	var SPR14 = 25+qq*25*Math.sin( 4*q );
	
	var that = this;
	var bn = 0;
	function bone_su(dist,size)
	{
		turtle.su(dist/2);
		
		if (bn<that.lines.length)
		{
			var x = turtle.basis.x.clone().multiplyScalar(size);
			var y = turtle.basis.y.clone().multiplyScalar(Math.abs(dist));
			var z = turtle.basis.z.clone().multiplyScalar(size);
			that.lines[bn].matrix.makeBasis(x,y,z);
			that.lines[bn].matrix.setPosition(turtle.basis.o);
			that.lines[bn].updateMatrixWorld();
		}
		turtle.su(dist/2);
		bn++;
	}
	function bone_fd(dist,size)
	{
		turtle.fd(dist/2);
		
		if (bn<that.lines.length)
		{
			var y = turtle.basis.x.clone().multiplyScalar(-Math.abs(dist));
			var x = turtle.basis.y.clone().multiplyScalar(size);
			var z = turtle.basis.z.clone().multiplyScalar(size);
			that.lines[bn].matrix.makeBasis(x,y,z);
			that.lines[bn].matrix.setPosition(turtle.basis.o);
			that.lines[bn].updateMatrixWorld();
		}
		turtle.fd(dist/2);
		bn++;
	}
	
	var turtle = new MEIRO.Turtle();

	//turtle.su( 0 );
	turtle.lt( 200*Math.sin( t/5 ) );
	turtle.upp( 200*Math.sin( t/8 ) );
	turtle.rr( 200*Math.cos( t/13 ) );

	// now at waist
	var waist = turtle.basis.clone();
	fla( 0,-2,3,-4 );

	bone_su(Ls[1],1); //turtle.su( Ls[1] );
	turtle.lt( SP1 );
	turtle.lr( SP2 );
	var neck = turtle.basis.clone();
	fla( 4,-4,4,-8 );

	bone_su(Ls[2],0.7); //turtle.su( Ls[2] );
	fla( 8,-2,2,-3 );

	bone_su(Ls[9],0.3); //turtle.su( Ls[9] );
	turtle.lt( SP3 );
	turtle.lr( SP4 );
	turtle.dn( SP5 );
	fla( 12,-1,1,-1 );

	bone_su(Ls[8],0.5); //turtle.su( Ls[8] );
	fla( 16,-5,5,-5 );

	bone_su(Ls[7],0.7); //turtle.su( Ls[7] );
	fla( 20,-1,1,-1 );

	face(20,21,22,23);

	face(23,22,18,19);
	face(21,17,18,22);
	face(23,19,16,20);
	face(20,16,17,21);

	face(18,14,15,19);
	face(17,13,14,18);
	face(19,15,12,16);
	face(16,12,13,17);

	// start left hand
	turtle.basis.copy(neck);
	turtle.lt( 90 );
	turtle.upp( -20 );
	bone_fd(Ls[3],0.5); //turtle.fd( Ls[3] );
	turtle.dn( -20 );

	turtle.upp( -SP6x );
	turtle.rt( SP7x );

	bone_fd(Ls[4],0.65); //turtle.fd( Ls[4] );
	turtle.rt( SP8x );

	turtle.upp( -90 ); //LR LT
	flb( 24,2,-2,2 );


	bone_su(-Ls[5],0.5); //turtle.sd( Ls[5] );
	turtle.rr( SP9x );
	turtle.rt( SP10x );
	flb( 28,0.5,-0.5,0.5 );

	bone_su(-Ls[6],0.35); //turtle.sd( Ls[6] );
	flb( 32,3,-3,1 );

	face(32,33,34,35);
	face(32,35,31,28);
	face(35,34,30,31);
	face(34,33,29,30);
	face(33,32,28,29);

	face(28,31,27,24);
	face(31,30,26,27);
	face(30,29,25,26);
	face(29,28,24,25);

	// right hand

	turtle.basis.copy(neck);
	turtle.rt( 90 );
	turtle.upp( -20 );
	bone_fd(Ls[3],0.5); //turtle.fd( Ls[3] );
	turtle.dn( -20 );

	turtle.upp( -SP6 );
	turtle.lt( SP7 );

	bone_fd(Ls[4],0.65); //turtle.fd( Ls[4] );
	turtle.lt( SP8 );

	turtle.upp( -90 ); //
	flb( 36,2,-2,-2 );

	bone_su(-Ls[5],0.5); //turtle.sd( Ls[5] );
	turtle.lr( SP9 );
	turtle.lt( SP10 );
	flb( 40,0.5,-0.5,-0.5 );
	bone_su(-Ls[6],0.35); //turtle.sd( Ls[6] );
	flb( 44,3,-3,-1 );

	face(47,46,45,44);
	face(40,43,47,44);
	face(43,42,46,47);
	face(42,41,45,46);
	face(41,40,44,45);

	face(36,39,43,40);
	face(39,38,42,43);
	face(38,37,41,42);
	face(37,36,40,41);

	face(14,10,11,15);
	face(13,9,10,14);
	face(15,11,8,12);
	face(12,8,9,13);
	
	face(8,11,39,36);
	face(11,7,38,39);
	face(7,4,37,38);
	face(4,8,36,37);

	face(24,27,10,9);
	face(27,26,6,10);
	face(26,25,5,6);
	face(25,24,9,5);

	face(10,6,7,11);
	face(8,4,5,9);
	
	
	// do the left leg
	turtle.basis.copy(waist);
	turtle.rr( 45 );
	bone_su(-Ls[10],0.8); //turtle.sd( Ls[10] );
	flc( 60,5,-5,2 );

	turtle.rr( -45 );
	turtle.lr( SPL11 );
	turtle.upp( -SPL12 );
	turtle.lt( SPL13 );

	bone_su(-Ls[11],0.65); //turtle.sd( Ls[11] );
	turtle.lt( -90 );
	turtle.dn( -SPL14 );
	flb( 48,3,-3,-3 );

	bone_su(-Ls[12],0.5); //turtle.sd( Ls[12] );
	flb( 52,1,-1,-1 );

	bone_su(-2*Ls[15],0.35); //turtle.sd( 2*Ls[15] );
	flb( 56,2,-2,-2 );

	bone_su(Ls[15],0.2); //turtle.su( Ls[15] );
	turtle.upp( -90 );
	bone_su(-Ls[16],0.35); //turtle.sd( Ls[16] );
	fla( 62,1,-1,5 );

	face(62,65,64,63);
	face(55,59,65,62);
	face(59,56,64,65);
	face(56,52,63,64);
	face(52,55,62,63);
	face(52,56,57,53);
	face(56,59,58,57);
	face(59,55,54,58);
	face(53,57,58,54);
	face(48,52,53,49);
	face(49,53,54,50);
	face(50,54,55,51);
	face(51,55,52,48);

	
	// do the right leg
	turtle.basis.copy(waist);
	turtle.lr( 45 );
	bone_su(-Ls[10],0.8); //turtle.sd( Ls[10] );
	flc( 66,5,-5,-2 );
	turtle.lr( -45 );
	turtle.rr( SPR11 );
	turtle.upp( -SPR12 );
	turtle.rt( SPR13 );

	bone_su(-Ls[11],0.65); //turtle.sd( Ls[11] );
	turtle.rt( -90 );
	turtle.dn( -SPR14 );
	flb( 68,-3,3,3 );

	bone_su(-Ls[12],0.5); //turtle.sd( Ls[12] );
	flb( 72,1,-1,1 );

	bone_su(-2*Ls[15],0.35); //turtle.sd( 2*Ls[15] );
	flb( 76,2,-2,2 );
	bone_su(Ls[15],0.2); //turtle.su( Ls[15] );
	turtle.upp( -90 );
	bone_su(-Ls[16],0.35); //turtle.sd( Ls[16] );
	fla( 80,1,-1,-5 );

	face(6,2,3,7);
	face(5,1,2,6);
	face(4,0,1,5);
	face(7,3,0,4);
	
	face(2,66,60,3);
	face(0,61,67,1);

	face(3,51,48,0);
	face(61,49,50,60);

	face(68,73,72,69);
	face(69,72,75,70);
	face(70,75,74,71);
	face(71,74,73,68);

	face(82,83,80,81);
	face(75,72,81,80);
	face(72,76,82,81);
	face(76,79,83,82);
	face(79,75,80,83);
	face(73,77,76,72);
	face(77,78,79,76);
	face(78,74,75,79);
	face(74,78,77,73);
	
	face(3,60,50,51);
	face(61,60,66,67);
	face(71,68,67,66);
	face(61,0,48,49);
	face(66,2,70,71);
	face(69,70,2,1);
	face(68,69,1,67);
	
	var objectMaterial = new THREE.MeshPhongMaterial({color:'orange',shininess:100,polygonOffset:true,polygonOffsetFactor:1,polygonOffsetUnits:0.1,side:THREE.DoubleSide,shading:THREE.FlatShading,transparent:true,opacity:0.7,depthTest:false});		
	var frameMaterial = new THREE.MeshPhongMaterial({color:'black',depthTest:false,wireframe:true,transparent:true,opacity:0.05});
	
	var modifier = new THREE.SubdivisionModifier( 1 );
	var geom = geometry;
	
	modifier.modify(geom);
	geom.computeFaceNormals();
	
	this.object.geometry.dispose();
	this.object.material.dispose();
	
	this.object.geometry = geom;
	this.object.material = objectMaterial;
	
	this.frame.geometry = geom;
	this.frame.material = frameMaterial;
}



// аниматор на модела
MEIRO.Models.M26471.prototype.onAnimate = function(time)
{
	this.generateFigure(time);

	this.material.opacity = 0.7*this.k;
	
	TWEEN.update();
	reanimate();
}



// информатор на модела
MEIRO.Models.M26471.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Кожа от повърхнини с подразделяне</h1>';

	s += '<p>Моделирането на кожа чрез подразделяне се реализира чрез точки, свързани към костите. Тези точки определят формата на кожата. При движение на скелета те си променят положенията, а това променя и кожата. Движението се извършва на най-грубото ниво и на всеки кадър се извършва подразделяне.</p>';
	
	element.innerHTML = s;
}


// превключвател на модела
MEIRO.Models.M26471.prototype.onShowHide = function(element)
{
	var that = this;
	new TWEEN.Tween({k:that.k})
		.to({k:that.k<0.5?1:0},500)
		.easing( TWEEN.Easing.Quadratic.InOut )
		.onUpdate( function(){that.k=this.k} )
		.start();

	reanimate();
}