// Transcrito de las cuatro páginas de CARTA SANDWICHERIA RUTA CENTRAL .pdf.
const burgerRows = [
 ['5','Ruta 5','Queso cheddar, cebolla caramelizada, pepinillo, queso mantecoso, tocino y mayonesa.',7200,9600],
 ['aleman','Ruta Alemán','Tomate, chucrut y mayonesa.',5500,7200],
 ['italiano','Ruta Italiano','Tomate, palta y mayonesa.',6100,8250],
 ['dinamico','Ruta Dinámico','Tomate, palta, chucrut, americana y mayonesa.',7850,9650],
 ['77','Ruta 77','Queso cheddar, tomate, lechuga, tocino, cebolla morada, pepinillos y mayonesa.',6600,8650],
 ['66','Ruta 66','Tocino, queso cheddar, cebolla morada y mayonesa.',5300,6990],
 ['libertadores','Ruta Libertadores','Aros de cebolla, tocino, queso cheddar y mayonesa.',5990,8100],
 ['68','Ruta 68','Queso cheddar, tomate, lechuga, pepinillo y mayonesa.',5650,7700],
 ['central','Ruta Central','Palta, tomate, lechuga, queso mantecoso, cebolla caramelizada, cebolla morada, tocino y mayonesa.',8500,10300],
 ['norte','Ruta Norte','Queso mantecoso, cebolla caramelizada, champiñón y mayonesa.',7400,9450],
 ['sur','Ruta Sur','Tomate, lechuga, cebolla morada, queso cheddar, pepinillo y mayonesa.',6400,8400],
 ['79','Ruta 79','Huevo frito, cebolla caramelizada, tocino y mayonesa.',5500,7500],
 ['88','Ruta 88','Doble queso cheddar y mayonesa.',4700,6700],
 ['azteca','Ruta Azteca','Queso cheddar, lechuga, guacamole, jalapeño y mayonesa.',6700,8700]
];
const sandwichRows = [
 ['solo','Solo','Mayonesa.',4150],['italiano','Italiano','Tomate, palta y mayonesa.',6000],
 ['completo','Completo','Chucrut, americana, tomate y mayonesa.',5100],['aleman','Alemán','Chucrut, tomate y mayonesa.',4900],
 ['dinamico','Dinámico','Tomate, palta, chucrut, americana y mayonesa.',6900],['chacarero','Chacarero','Tomate, porotos verdes, ají verde y mayonesa.',4900],
 ['tomate','Tomate mayo','Tomate y mayonesa.',4500],['palta','Palta mayo','Palta y mayonesa.',5650],
 ['brasileno','Brasileño','Queso fundido, palta y mayonesa.',6800],['barros','Barros Luco','Queso fundido y mayonesa.',5750],
 ['rodeo','Rodeo','Queso fundido, cebolla caramelizada, tocino y mayonesa.',6550],['pobre','A lo pobre','Huevo, cebolla caramelizada, queso fundido y mayonesa.',6900],
 ['antigua','Antigua','Palta, americana y mayonesa.',6750],['campesino','Campesino','Tomate, palta, ají verde y mayonesa.',6900]
];
const hotdogPrices = [[1500,3100,2200],[2950,4500,3650],[2400,3850,3100],[2200,3600,2900],[3500,5000,4200],[2500,3750,3200],[2100,3400,2800],[2850,4300,3550],[4250,5700,4950],[3000,4650,3700],[3900,5300,4600],[4150,5600,4850],[3750,5500,4450],[3700,5550,4400]];
const hotdogDescriptions = ['Mayonesa.','Tomate, palta y mayonesa.','Chucrut, americana y tomate.','Chucrut, tomate y mayonesa.','Tomate, palta, chucrut y americana.','Tomate, porotos verdes y ají verde.','Tomate y mayonesa.','Palta y mayonesa.','Queso fundido, palta y mayonesa.','Queso fundido y mayonesa.','Queso fundido, cebolla caramelizada, tocino y mayonesa.','Huevo, cebolla caramelizada, queso fundido y mayonesa.','Palta, americana y mayonesa.','Tomate, palta, ají verde y mayonesa.'];
const menuProducts = [
 ...burgerRows.map(([id,name,description,simple,double])=>({id:'b-'+id,name,description,category:'burger',included:'Incluye papas fritas',variants:[{label:'Simple',price:simple},{label:'Doble',price:double}]})),
 ...sandwichRows.map(([id,name,description,price])=>({id:'s-'+id,name,description,category:'sandwich',included:'Base a elección + papas fritas',variants:['Churrasco','Lomito','Pollo','Champiñón'].map(label=>({label,price}))})),
 ...sandwichRows.map(([id,name],i)=>({id:'h-'+id,name,description:hotdogDescriptions[i],category:'hotdog',included:'Elige completo, as o vienesa tocino',variants:['Completo','As','Vienesa tocino'].map((label,j)=>({label,price:hotdogPrices[i][j]}))})),
 ...['Tradicional','Pollo','Vegetariana'].map((name,i)=>({id:'ch-'+i,name:'Chorrillana '+name.toLowerCase(),description:'',category:'share',variants:[{label:'Chica',price:7500},{label:'Mediana',price:11500},{label:'Grande',price:17000}]})),
 ...[
 ['papas','Papas fritas',[2000,3500,5500]],['salchipapas','Salchipapas',[2600,null,4700]],['cheddar','Papas cheddar tocino',[4500,null,7000]],['supremas','Papas supremas',[5200,null,8500]]
 ].map(([id,name,prices])=>({id, name,description:'',category:'share',variants:prices.map((price,i)=>({label:['Chica','Mediana','Grande'][i],price})).filter(v=>v.price!==null)})),
 ...[['aros','Aros de cebolla',2800,5600],['nuggets','Nuggets',2800,5600],['empanadas','Empanadas',2350,4700]].map(([id,name,s,l])=>({id,name,description:'',category:'share',variants:[{label:'6 unidades',price:s},{label:'12 unidades',price:l}]})),
 {id:'mix',name:'Mix pincho',description:'Papas fritas, empanadas, nuggets y aros de cebolla.',category:'share',variants:[{label:'Porción',price:6800}]},
 ...[['lata','Bebida lata 350 ml',1500],['bebida','Bebida 1,5 L',2500],['agua','Agua mineral',1000],['jumex','Jugos Jumex',1500]].map(([id,name,price])=>({id,name,description:'Consulta sabores disponibles al confirmar.',category:'drink',variants:[{label:'Unidad',price}]}))
];
if(typeof module!=='undefined')module.exports={menuProducts};
