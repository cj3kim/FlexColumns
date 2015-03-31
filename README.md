# FlexColumns
A column layout system for web development in Famous.

##Current Features

* Create and specify as many columns as needed.
* Add surfaces or views to columns for layout.
* You cannot add a surface to a column when the surface width is larger than the
column width. 
* You can specify gutter rows and columns.

##TODOS
* Responsive layouts.

##Getting Started
    npm install flex-columns;
    
    //Code Example
    var FlexColumns = require('flex-columns');

    var flexColumn = new FlexColumns({
      gutterCol: 20,
      gutterRow: 20
    });

    var colOneWidth = 100;
    var colTwoWidth = 150;

    var bigSurface = new Surface({
      size: [100, 100],
      content: "I'm a big surface.",
      properties: {
        backgroundColor: 'red'
      } 
    });

    var smallSurface = new Surface({
      size: [50, 50],
      content: "I'm a small surface.",
      properties: {
        backgroundColor: 'blue'
      } 
    });
    flexColumn.createCol(colOneWidth).addSurfaceToCol(0, bigSurface);
    flexColumn.addSurfaceToCol(0, smallSurface);
    
    var veryLargeSurface = new Surface({
      size: [125, 125],
      content: "I'm a small surface.",
      properties: {
        backgroundColor: 'blue'
      } 
    }); 

    flexColumn.createCol(colTwoWidth).addSurfaceToCol(1, veryLargeSurface);
  

