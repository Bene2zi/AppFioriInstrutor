sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/ui/model/Filter",
    "sap/ui/model/FilterOperator", 
    "sap/m/BusyDialog",
    "sap/m/PDFViewer"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller,JSONModel,MessageBox,Filter,FilterOperator,BusyDialog,PDFViewer) {
        "use strict";

        return Controller.extend("AppFioriAluno99.appfiorialuno99.controller.Main", {

            onInit: function () {
                //Primeiro git no github
                this.oFieldScreen   = new JSONModel({ btnsVisible : false, btnEditVisible : true , btnEnabled : true });
                this.oConsModel     = new JSONModel({ CadastroSet : [], aExcluded : []});
                this.BusyDialog     = new BusyDialog( )              
                  
                this.oConsModel.updateBindings(true);
                this.oFieldScreen.updateBindings(true);  

                this.oPdfModel = new JSONModel({})
        	    this.getView().setModel(this.oPdfModel, "oPdfModel");

            },

            onSearch: function (oEvent) {
                debugger
                let Cpf = oEvent.getParameter('selectionSet')[0].getValue().length ? oEvent.getParameter('selectionSet')[0].getValue() : undefined
                let Nome = oEvent.getParameter('selectionSet')[1].getValue().length ? oEvent.getParameter('selectionSet')[1].getValue() : undefined
                let Sobrenome = oEvent.getParameter('selectionSet')[2].getValue().length ? oEvent.getParameter('selectionSet')[2].getValue() : undefined
                let DataNasc = oEvent.getParameter('selectionSet')[3].getDateValue() ? oEvent.getParameter('selectionSet')[3].getDateValue() : undefined
                let aFilter = []

                if (Cpf) aFilter.push(new Filter('Cpf', FilterOperator.Contains, Cpf))
                if (Nome) aFilter.push(new Filter('Nome', FilterOperator.Contains, Nome))
                if (Sobrenome) aFilter.push(new Filter('Sobrenome', FilterOperator.Contains, Sobrenome))
                if (DataNasc) aFilter.push(new Filter('DataNascimento', FilterOperator.EQ, DataNasc))

                this.getView().byId('idCadastroTable').getBinding('items').filter(aFilter)
                this.getView().byId('idCadastroTable').updateBindings(true)

                /*
                this.getOwnerComponent().getModel('oCadastroModel').read("/CadastroSet",{
                    filters: aFilter,
                    sync: true,
                    success:function(oData,oResponse){
                        this.oCadastroModel = new JSONModel({ Cadastro : oData.results})
                        this.getView().setModel(this.oCadastroModel,'oCadastroModel')

                        this.oCadastroModel.updateBindings(true)
                        //MessageBox.success("Registro carregado com Sucesso");
                    }.bind(this),
                    error:function(oData,oResponse){
                        //MessageBox.error("Erro ao gravar o registro");
                    }.bind(this)
                })	
                */
            },

            onAdd : function(oEvent){

                this.onChangeBtnEnabled(true)   

                this.oCadastroModelLine = new sap.ui.model.json.JSONModel({ Cpf: '', Nome: '', Sobrenome: '', Email:'', Telefone:'', DataNascimento : new Date()})
                this.getView().setModel(this.oCadastroModelLine, 'oCadastroModelLine')
                this.oCadastroModelLine.updateBindings(true)

                this.onOpenDialog()
            },



            onOpenDialog : function(){
                this._dialogCadastro = sap.ui.xmlfragment("AppFioriAluno99.appfiorialuno99.view.Cadastro", this)
    			if (this.getView().$().closest(".sapUiSizeCompact").length > 0){
    				this._dialogCadastro.addStyleClass("sapUiSizeCompact") 
    			} else { 
    				this._dialogCadastro.addStyleClass("sapUiSizeCozy")
    			}
            	
            	this.getView().addDependent(this._dialogCadastro)
            	
            	this._dialogCadastro.open()
            },


            onConfirmar : function(oEvent){

                let oModelSend = this.oCadastroModelLine.getData()
                
                if(this.oFieldScreen.getData().btnEnabled){
                    this.getOwnerComponent().getModel('oCadastroModel').create('/CadastroSet',oModelSend,{
                        success:function(oData,oResponse){
                            this.getView().byId('idCadastroTable').updateBindings(true)
                            MessageBox.success("Registro gerado com Sucesso");
                        }.bind(this),
                        error:function(oData,oResponse){
                            MessageBox.error("Erro ao gravar o registro");
                        }.bind(this)
                    })	
                }else{
                    let oServiceEntity = "/CadastroSet('"+ oModelSend.Cpf +"')"
                    this.getOwnerComponent().getModel('oCadastroModel').update(oServiceEntity,oModelSend,{
                        success:function(oData,oResponse){
                            this.getView().byId('idCadastroTable').updateBindings(true)
                            MessageBox.success("Registro gerado com Sucesso");
                        }.bind(this),
                        error:function(oData,oResponse){
                            MessageBox.error("Erro ao gravar o registro");
                        }.bind(this)
                    })	
                }

                this._dialogCadastro.close()
            },

            onCancelar : function(oEvent){
                this._dialogCadastro.close()
            },

            onAfterClose : function(oEvent){
                this._dialogCadastro.destroy()
            },

            onEdit : function(oEvent){
                
                let aSelectedContexts = this.getView().byId('idCadastroTable').getSelectedContextPaths();
                
                if(aSelectedContexts.length){
                    let oModel = this.getView().getModel('oCadastroModel').getObject(aSelectedContexts[0])
                    this.oCadastroModelLine = new sap.ui.model.json.JSONModel(oModel)
                    this.getView().setModel(this.oCadastroModelLine, 'oCadastroModelLine')
                    this.oCadastroModelLine.updateBindings(true)
                    this.onChangeBtnEnabled(false)
                    this.onOpenDialog()
                } 
            },

            onChangeBtnEnabled : function(oEnabled){ 
                this.oFieldScreen.getData().btnEnabled = oEnabled
                this.getView().setModel(this.oFieldScreen,"oFieldScreen");
                this.oFieldScreen.updateBindings(true)
            },

            onRemove : function(oEvent){
                if(this.getView().byId('idCadastroTable').getSelectedContextPaths().length){
                    let oModel = this.getView().getModel('oCadastroModel').getObject( this.getView().byId('idCadastroTable').getSelectedContextPaths()[0])

                    MessageBox.warning(	'Deseja eliminar o CPF: ' + oModel.Cpf + ' ?', {
                        actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                        emphasizedAction: MessageBox.Action.YES,
                        onClose: function (sAction) {
                            if(sAction === MessageBox.Action.YES){
                                let oModel = this.getView().getModel('oCadastroModel').getObject( this.getView().byId('idCadastroTable').getSelectedContextPaths()[0])  

                                this.getOwnerComponent().getModel('oCadastroModel').remove("/CadastroSet('" + oModel.Cpf + "')",{
                                    success:function(oData,oResponse){
                                        this.getView().byId('idCadastroTable').updateBindings(true)
                                        MessageBox.success("Registro eliminado com Sucesso");
                                    }.bind(this),
                                    error:function(oData,oResponse){
                                        MessageBox.error("Erro ao eliminar o registro.");
                                    }.bind(this)
                                })
                            }
                        }.bind(this)
                    });
                }
            },

/*
            onDependentes : function(oEvent){
                let aSelectedContexts = this.getView().byId('idCadastroTable').getSelectedContextPaths();
                
                if(aSelectedContexts.length){
                    this.oDependenteModel = new sap.ui.model.json.JSONModel({CadastroDependenteSet:[]})

                    let oModel = this.getView().getModel('oCadastroModel').getObject(aSelectedContexts[0])
                    this.oCadastroModelLine = new sap.ui.model.json.JSONModel(oModel)
                    this.getView().setModel(this.oCadastroModelLine, 'oCadastroModelLine')
                    this.oCadastroDependenteModelLine = new sap.ui.model.json.JSONModel({ CpfDependente: '', Nome: '', Sobrenome: '', Email:'', Telefone:'', DataNascimento : new Date()})
 
                    this.getView().setModel(this.oDependenteModel, 'oDependenteModel')
                    this.getView().setModel(this.oCadastroDependenteModelLine, 'oCadastroDependenteModelLine')
                    this.oCadastroDependenteModelLine.updateBindings(true)
                    this.oCadastroModelLine.updateBindings(true)
                    this.oDependenteModel.updateBindings(true)
                    this.onChangeBtnEnabled(false)
                    this.onOpenDependentesDialog()
                } 
            },

            onOpenDependentesDialog : function(){
                this._dialogCadastroDependentes = sap.ui.xmlfragment("AppFioriAluno99.appfiorialuno99.view.Dependentes", this)
    			if (this.getView().$().closest(".sapUiSizeCompact").length > 0){
    				this._dialogCadastroDependentes.addStyleClass("sapUiSizeCompact") 
    			} else { 
    				this._dialogCadastroDependentes.addStyleClass("sapUiSizeCozy")
    			}
            	

            	this.getView().addDependent(this._dialogCadastroDependentes)
            	
            	this._dialogCadastroDependentes.open()
            },

            onCancelarDependentes : function(oEvent){
                this._dialogCadastroDependentes.close()
            },

            onAfterCloseDependentes : function(oEvent){
                this._dialogCadastroDependentes.destroy()
            },

            onAddDepentende : function(oEvent){

                this.oCadastroDependenteModelLine.getData().Cpf = this.oCadastroModelLine.getData().Cpf
                this.oDependenteModel.getData().CadastroDependenteSet.push(this.oCadastroDependenteModelLine.getData())
                this.oDependenteModel.updateBindings(true)


                this.oCadastroModelLine = new sap.ui.model.json.JSONModel({ CpfDependente: '', Nome: '', Sobrenome: '', Email:'', Telefone:'', DataNascimento : new Date()})
                    this.getView().setModel(this.oCadastroDependenteModelLine, 'oCadastroDependenteModelLine')
                    this.oCadastroDependenteModelLine.updateBindings(true)
            },

            onSalvarDependente : function(oEvent){
                this._dialogCadastroDependentes.close()
            },

             */
            onSalvar : function(oEvent){

                let oModelSend = { Cpf : '12345678902',
                Nome : 'Joao', 
                Sobrenome : 'Fernandes', 
                DataNascimento : new Date()}
                /*, 
                CadastroDependentesSet : [] }

                oModelSend.CadastroDependentesSet.push({
                    Cpf: '12346578902', 
                    CpfDependente: '32165498701', 
                    Nome: 'Juliano', 
                    Sobrenome:'Fernandes', 
                    DataNascimento: new Date(),
                    NotasDependentesSet: [{CpfDependente: '32165498701', Material:'1',Nota: '12'}, {CpfDependente: '32165498701', Material:'2',Nota: '50'}] })
                 */

                this.getOwnerComponent().getModel('oCadastroModel').create('/CadastroSet',oModelSend,{
                    success:function(oData,oResponse){
                        this.getView().byId('idCadastroTable').updateBindings(true)
                        MessageBox.success("Registro gerado com Sucesso");
                    }.bind(this),
                    error:function(oData,oResponse){
                        MessageBox.error("Erro ao gravar o registro");
                    }.bind(this)
                })	
            },

           
            showPDF: function(oEvent){
                let oModel = this.getView().getModel('oCadastroModel').getObject( this.getView().byId('idCadastroTable').getSelectedContextPaths()[0])
                var opdfViewer = new PDFViewer();
                this.getView().addDependent(opdfViewer);
                var sServiceURL = this.getOwnerComponent().getModel('oCadastroModel').sServiceUrl;
                var sSource = sServiceURL + "/DependentesPdfSet('" + oModel.Cpf + "')/$value";
                opdfViewer.setSource(sSource);
                opdfViewer.setTitle( oModel.Cpf + " PDF");
                opdfViewer.open();	
            },
            //Final
        });
    });
