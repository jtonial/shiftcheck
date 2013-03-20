function psmtest(){

  var psmtext = document.getElementById("test_paste");
  var st = psmtext.value;
  var Rows = st.split("\n");
  var numrows = Rows.length; 

  console.log(Rows);
  console.log('rows: '+numrows);

  var obj = [];

  Rows.forEach( function (row) {
    var Arr = row.split("\t");
    obj.push(Arr);
  })

  console.log(obj);

}
  /*for (var i = 0 ; i < numrows ; i++) {
      // tab or comma deliminated data
      if ( Ast[i].split(",",2)[1] != null ) {
        ys[i] = Ast[i].split(",")[1]; 
        xs[i] = Ast[i].split(",")[0];
      }
      if ( Ast[i].split("\t",2)[1] != null ) { 
        ys[i] = Ast[i].split("\t")[1]; 
        xs[i] = Ast[i].split("\t")[0];
      }
  }
  console.log(xs);
  console.log(ys);

  var xss = [];
  var yss = [];
  var numgoodrows = 0;
  var iii =0;
  for (ii = 0 ; ii < numrows ; ii++) { 
      if ( xs[ii] != null && ys[ii] != null) {
          xss[iii] = xs[ii];
          yss[iii] = ys[ii];
          iii++;
      }
  }
  numgoodrows = iii;
  // next I need to convert to floating point array var xf = [], var yf = [];

  var xf = [];
  var yf = [];

  for (ii = 0 ; ii < numgoodrows ; ii++) { 
    xf[ii] = parseFloat(xss[ii]);
    yf[ii] = parseFloat(yss[ii]);
  }

}*/