
//	Основи на Компютърната Графика
//	Модел 26251 - Модел на извънземно месоядно дърво
//	П. Бойчев, 2017


// конструктор на модела
MEIRO.Models.M26251 = function M26251(room)
{
	MEIRO.Model.apply(this, arguments);

	var ratio = 0.9;
	var trunkGeometry = new THREE.CylinderGeometry(0.2*ratio,0.2,1.5,12,1,!true);
	var trunkMaterial = new THREE.MeshPhongMaterial({color:'chocolate'});
	trunkGeometry.translate(0,0.75,0);

	var ratio2 = 0.8;
	var leafGeometry = new THREE.CylinderGeometry(0.7*ratio2,0.7,2,3,1,true);
	var leafMaterial = new THREE.MeshPhongMaterial({color:'chocolate'});
	leafGeometry.translate(0,0.5,0);
	var leafMaterial = new THREE.MeshPhongMaterial({color:'forestgreen',side:THREE.DoubleSide});
	
	function Leaf()
	{
		var l;
		var leaf = new THREE.Mesh(leafGeometry,leafMaterial);
		for (l=leaf, n=0; n<15; n++)
		{
			var newLeaf = new THREE.Mesh(leafGeometry,leafMaterial);
			newLeaf.position.y = 1.4;
			newLeaf.scale.set(ratio2,1,ratio2);
			l.add( newLeaf );
			l.subleaf = newLeaf;
			l = newLeaf;
		}

		return leaf;
	}
	
	function Tree()
	{
		var t;
		
		var tree = new THREE.Mesh(trunkGeometry,trunkMaterial);
		tree.leaves = [];
		
		for (t=tree, n=0; n<10; n++)
		{
			var newTree = new THREE.Mesh(trunkGeometry,trunkMaterial);
			newTree.position.y = 1.4;
			newTree.scale.set(ratio,ratio,ratio);
			t.add( newTree );
			t.subtree = newTree;
			t = newTree;
		}
		
		for (var i=0; i<7; i++)
		{
			//var pow = Math.pow(0.8,i);
			var newLeaf = Leaf();
			//newLeaf.scale.set(pow,pow,pow);
			newLeaf.position.y = 0.9;
			t.add( newLeaf );
			tree.leaves[i] = newLeaf;
		}
		
		return tree;
	}
	
	this.tree = [];
	for (var i=0; i<10; i++)
	{
		var t = Tree();
		t.position.set(16*Math.random()-8,Math.random()/10-3,16*Math.random()-8);
		this.tree.push( t );
	}
	
	// сглобяване на целия модел
	for (var i=0; i<10; i++)
		this.image.add(this.tree[i]);
}

MEIRO.Models.M26251.prototype = Object.create(MEIRO.Model.prototype);

MEIRO.Models.M26251.DIST = {MIN:10, MAX:40, HEIGHT:-3};
MEIRO.Models.M26251.POS = {DIST:20, ROT_X:0, ROT_Y:0};
MEIRO.Models.M26251.ROT_Y = {MIN:-0.1, MAX:0.7};


// аниматор на модела
MEIRO.Models.M26251.prototype.onAnimate = function(time)
{
	for (var i=0; i<10; i++)
	{
		var offset = Math.sin(i);
		for (var t=this.tree[i].subtree,n=0; t; t=t.subtree,n++)
		{
			var s = 0.1+n/20;
			t.rotation.x = s*Math.sin(0.0015*time+n/3+offset);
			t.rotation.y = s*Math.cos(0.0013*time+n/2.5-offset);
			
			for (var j=0; j<7; j++)
				for (var l=this.tree[i].leaves[j],k=0; l; l=l.subleaf,k=1)
					l.rotation.set(0.2+0.2*Math.sin((0.002+i/3000)*time+offset),k?0:2*Math.PI/7*j,0,'YXZ');
		}
	}
	
	reanimate();
}



// информатор на модела
MEIRO.Models.M26251.prototype.onInfo = function(element)
{
	var s = '';
	s += '<h1>Модел на извънземно месоядно дърво</h1>';

	s += '<p>Анимацията чрез слоеве може да се комбинира с друга анимация. Този модел раздвижва извънземно месоядно дърво. Стъблото е реализирано чрез словев. Всяко от листата също е направено от слоеве. Прикрепяйки листата към последния слой от стъблото, те приемат положението и ориентацията, акумилурани от всички слоеве на стъблото.</p>';
	
	element.innerHTML = s;
}
