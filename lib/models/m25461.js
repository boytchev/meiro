
//	Основи на Компютърната Графика
//	Модел 25461 - Преобразуване на координатни системи
//	П. Бойчев, 2017



// конструктор на модела
MEIRO.Models.M25461 = function M25461(room, model)
{
	MEIRO.Model.apply(this, arguments);

	var material1 = new THREE.MeshPhongMaterial( {color:'cornflowerblue', shininess:100} );
	var material2 = new THREE.MeshPhongMaterial( {color:'orange', shininess:100} );
	var material3 = new THREE.MeshPhongMaterial( {color:'lime', shininess:100} );
	var material4 = new THREE.MeshPhongMaterial( {color:'red', shininess:100} );
	
	this.sysA = new MEIRO.Axes3D([-2,2],[0,2],[-2,2],true);
	//this.sysA.position.x = -5;
	
	this.ballA1 = new THREE.Mesh( MEIRO.PRIMITIVE.GEOMETRY.SPHERE, material1);
	this.ballA1.scale.set(0.5,0.5,0.5);
	this.ballA2 = new THREE.Mesh( MEIRO.PRIMITIVE.GEOMETRY.SPHERE, material2);
	this.ballA2.scale.set(0.5,0.5,0.5);
	this.ballA3 = new THREE.Mesh( MEIRO.PRIMITIVE.GEOMETRY.SPHERE, material3);
	this.ballA3.scale.set(0.5,0.5,0.5);
	this.ballA4 = new THREE.Mesh( MEIRO.PRIMITIVE.GEOMETRY.SPHERE, material4);
	this.ballA4.scale.set(0.5,0.5,0.5);
	
	this.basis = new MEIRO.Basis();
	
	this.sysB = new MEIRO.Axes3D([-2,2],[0,2],[-2,2],true);
	this.sysB.matrixAutoUpdate = false;
	
	this.ballB1 = new THREE.Mesh( MEIRO.PRIMITIVE.GEOMETRY.SPHERE, material1);
	this.ballB1.scale.set(0.5,0.5,0.5);
	this.ballB2 = new THREE.Mesh( MEIRO.PRIMITIVE.GEOMETRY.SPHERE, material2);
	this.ballB2.scale.set(0.5,0.5,0.5);
	this.ballB3 = new THREE.Mesh( MEIRO.PRIMITIVE.GEOMETRY.SPHERE, material3);
	this.ballB3.scale.set(0.5,0.5,0.5);
	this.ballB4 = new THREE.Mesh( MEIRO.PRIMITIVE.GEOMETRY.SPHERE, material4);
	this.ballB4.scale.set(0.5,0.5,0.5);
	
	// сглобяване на целия модел
	this.image.add(this.sysA,this.ballA1,this.ballA2,this.ballA3,this.ballA4);
	this.image.add(this.sysB,this.ballB1,this.ballB2,this.ballB3,this.ballB4);
}

MEIRO.Models.M25461.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M25461.DIST = {MIN:20, MAX:50, HEIGHT:0};
MEIRO.Models.M25461.POS = {DIST:30, ROT_X:0.7, ROT_Y:0.3};
MEIRO.Models.M25461.ROT_Y = {MIN:-0.1, MAX:0.7};



// аниматор на модела
MEIRO.Models.M25461.prototype.onAnimate = function(time)
{
	this.sysA.rotateLabels();
	
	this.ballA1.position.set(-1,0.5+3*Math.abs(Math.sin(time/400)),-1);
	this.ballA2.position.set(-1,0.5+3*Math.abs(Math.sin(time/500)),1);
	this.ballA3.position.set(1,0.5+3*Math.abs(Math.sin(time/600)),-1);
	this.ballA4.position.set(1,0.5+3*Math.abs(Math.sin(time/700)),1);
	
	this.basis.reset();
	this.basis.rotateY(time/2640);
	this.basis.translate(10,2*Math.sin(time/500),0);
	this.basis.rotateX(time/1350);
	this.basis.rotateY(time/1640);
	this.basis.rotateZ(time/1930);
	
	this.basis.apply(this.sysB);
	
	var mat = new THREE.Matrix4();
	mat.makeBasis(this.basis.x,this.basis.y,this.basis.z);
	mat.setPosition(this.basis.o);

	this.ballB1.position.copy(this.ballA1.position.clone().applyMatrix4(mat)); 
	this.ballB2.position.copy(this.ballA2.position.clone().applyMatrix4(mat)); 
	this.ballB3.position.copy(this.ballA3.position.clone().applyMatrix4(mat)); 
	this.ballB4.position.copy(this.ballA4.position.clone().applyMatrix4(mat)); 

	reanimate();
}



// информатор на модела
MEIRO.Models.M25461.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Преобразуване на координатни системи</h1>';

	s += '<p>Ако координатите на базисните вектори и на началото на една координатна система спрямо друга координатна система се "пакетират" в матрица 4x4, то тази матрица служи за преход между двете координатни системи. Например, всяко движение на обект в едната координатна система се получава чрез съответното движение в другата, умножено по тази матрица.</p>';
	s += '<p>В центъра на модела е фиксирана координатна система. Около нея кръжи друга. Нейните базисни вектори и начална точка образуват матрица. Топащите се сфери във фиксираната система след умножение с тази матрица се появяват като топащи се по същия начин сфери, но в кръжащата система.</p>';

	element.innerHTML = s;
}