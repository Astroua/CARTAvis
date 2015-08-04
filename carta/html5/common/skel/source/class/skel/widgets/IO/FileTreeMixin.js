/**
 * Manage a tree displaying directories/files and display areas for the selected
 * directory and file.
 */

/*global mImport */
/*******************************************************************************
 * @ignore( mImport)
 ******************************************************************************/


qx.Mixin.define("skel.widgets.IO.FileTreeMixin", {

    
    members : {
        
        /**
         * Returns the full path to the file that was selected.
         * @return {String} the full path to the selected file.
         */
        getSelectedPath : function(){
            var pathDict = skel.widgets.Path.getInstance();
            var path = this.m_dirText.getValue();
            var file = this.m_fileText.getValue();
            var filePath = path;
            if ( file !== null ){
                filePath = filePath + pathDict.SEP + file;
            }
            return filePath;
        },
        
        /**
         * Sends a request to the server to update the tree with files/subdirectories
         * in the requested directory.
         * @param dirPath {String} - a fullPath to the directory that needs an update
         *      or an empty argument if the default directory is requested.
         */
        _initData : function( dirPath ){
            if ( this.m_connector === null ){
                this.m_connector = mImport("connector");
            }
            var path = skel.widgets.Path.getInstance();
            if ( typeof dirPath == "undefined"){
                dirPath = "";
            }
            var paramMap = "path:"+dirPath;
            var cmd = path.getCommandLoadData();
            this.m_connector.sendCommand(cmd, paramMap, this._loadDataCB( this ));
        },
        
        /**
         * Initialize the UI for the file tree and the directory/file text
         * fields.
         */
        _initTree : function(){
            //Initialize the tree.
            this.m_tree = new qx.ui.tree.Tree();
            //Send a request for a new directory to the server with a
            //double click.
            this.m_tree.addListener( "dblclick", function(event){
                var dirPath = this.m_dirText.getValue();
                
                //Request for root directory
                if ( dirPath.length === 0 ){
                    var path = skel.widgets.Path.getInstance();
                    dirPath = path.SEP;
                }
                this._initData( dirPath );
            }, this );
            //Update the directory and text fields when the tree selection
            //changes.
            this.m_tree.addListener( "changeSelection", function(event){
                var data = event.getData();
                if ( data.length > 0 ){
                    var nodeLabel = data[0].getLabel();
                    this._nodeSelected( nodeLabel );
                }
            }, this );
            this.m_tree.setWidth(300);
            this.m_tree.setHeight(300);
            
            //Initialize the directory
            var dirLabel = new qx.ui.basic.Label( "Directory:");
            this.m_dirText = new qx.ui.form.TextField();
            //Update the directory tree if the user presses enter in the directory
            //text field.
            this.m_dirText.addListener( "keypress", function( evt){
                var enterKey = false;
                if ( evt.getKeyIdentifier().toLowerCase() =="enter"){
                    var path = this.m_dirText.getValue();
                    this._initData( path );
                }
            }, this );
            this.m_dirText.setToolTipText( "Selected directory.");
            var dirContainer = new qx.ui.container.Composite();
            dirContainer.setLayout( new qx.ui.layout.HBox(2) );
            dirContainer.add( dirLabel );
            dirContainer.add( this.m_dirText, {flex:1});
            
            //Initialize the file.
            var fileNameLabel = new qx.ui.basic.Label( "File Name:");
            this.m_fileText = new qx.ui.form.TextField();
            this.m_fileText.setToolTipText( "Selected file.");
            this.m_fileText.setEnabled( false );
            var nameContainer = new qx.ui.container.Composite();
            nameContainer.setLayout( new qx.ui.layout.HBox());
            nameContainer.add( fileNameLabel );
            nameContainer.add( this.m_fileText, {flex:1} );
            
            //Add everything.
            this.m_treeDisplay = new qx.ui.container.Composite();
            this.m_treeDisplay.setLayout( new qx.ui.layout.VBox(2));
            this.m_treeDisplay.add( dirContainer );
            this.m_treeDisplay.add( this.m_tree );
            this.m_treeDisplay.add( nameContainer );
        },
        
        /**
         * Returns whether or not the passed in text represents a directory.
         * @param nodeLabel {String} - the display text of a tree node.
         * @return {boolean} - true if the tree node represents a directory; 
         *      false otherwise.
         */
        _isDirectory : function( nodeLabel ){
            var directory = false;
            for ( var i = 0; i < this.m_jsonObj.dir.length; i++ ){
                if ( this.m_jsonObj.dir[i].name == nodeLabel ){
                    if ( typeof this.m_jsonObj.dir[i].dir != "undefined"){
                        directory = true;
                    }
                    break;
                }
            }
            return directory;
        },
        
        /**
         * Update the tree with the new data.
         * @param anObject {skel.widgets.FileBrowser}.
         * @return {Function} callback for updating the UI with available image files.
         */
        _loadDataCB : function( anObject ){
            return function( fileList ){
                anObject._updateTree( fileList );
            };
        },
        
        /**
         * A node was selected in the tree; update the directory and file text
         * fields in response.
         * @param nodeLabel {String} the label of the node that was selected.
         */
        _nodeSelected : function( nodeLabel ){
            var path = skel.widgets.Path.getInstance();
            if ( nodeLabel == ".."){
                //Strip off child from path, and make that the new text.
                var lastSepIndex = this.m_path.lastIndexOf( path.SEP );
                if ( lastSepIndex >= 0 ){
                    var parentPath = this.m_path.substr(0, lastSepIndex );
                    this.m_dirText.setValue( parentPath );
                }
            }
            else if ( this._isDirectory( nodeLabel )){
                //If the node is a directory, add the directory to the base path.
                var childDir = this.m_path + path.SEP + nodeLabel;
                this.m_dirText.setValue( childDir );
            }
            else {
                //If the node is not a directory, reset the base path and put the
                //name in the file text.
                this.m_dirText.setValue( this.m_path );
                this.m_fileText.setValue( nodeLabel );
            }
        },
        
        /**
         * Update the UI with new directory information from the server.
         */
        _resetModel : function( ){
            this.m_path = this.m_jsonObj.name;
            this.m_dirText.setValue( this.m_path );
            this.m_jsonObj.name = "..";
            var jsonModel = qx.data.marshal.Json.createModel( this.m_jsonObj);
            if ( this.m_controller === null ){
                this.m_controller = new qx.data.controller.Tree(jsonModel,
                        this.m_tree, "dir", "name");
            }
            else {
                this.m_controller.setModel( jsonModel );
            }
            this.m_tree.getRoot().setOpen(true);
        },
        

        /**
         * Set whether or not the purpose of this file browser is to save files or not.
         * @param saveFile {boolean} - true if the purpose is to save files; false otherwise.
         */
        _setSaveFile : function( saveFile ){
            this.m_fileText.setEnabled( saveFile );
        },
        
        /**
         * Updates the file tree based on directory information from the server.
         * @param dataTree {String} representing available data files in a
         *                hierarchical JSON format
         */
        _updateTree : function(dataTree) {
            this.m_jsonObj = qx.lang.Json.parse(dataTree);
            this._resetModel();
            var errorMan = skel.widgets.ErrorHandler.getInstance();
            errorMan.clearErrors();
        },
        
        
        m_dirText : null,
        m_fileText : null,
        m_path : null,
        m_treeDisplay : null,
        m_connector : null,
        m_controller : null,
        m_jsonObj : null,
        m_tree : null
    }

});
