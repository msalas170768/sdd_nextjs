- El usuario debera poder realizar operaciones CRUD en la lista de Invoices.
- Se creara un unico componente llamado CrudInvoice para Insertar o Editar un Invoice con los parametros respectivos de la operacion a realizar, el componente se encargara de persistir el registro nuevo o editado, si el registro se grabo correctamente volvera a la lista de Invoices refrescando los datos, si hubo un error mostrara el error producido al momento de grabar en la base de datos, el componente tendra 2 botoces de Aceptar o Cancelar la insercion o edicion del registro
- Se creara una ruta dinamica /dashboard/create_invoice, que creara un nuevo registro de Invoice para ser editado por CrudInvoice.
- Se creara una ruta dinamica /dashboard/update_invoice/[id], que recuperara el registro de Invoice para ser editado por CrudInvoice.
- Se le habilitara in boton en la parte superior de la lista de Invoices para adicionar un registro.
- Se habilitara una columna de opciones en la lista de Invoices con las opciones CRUD: Consultar el Invoice (/dashboard/invoice/[id]), Editar Invoice, Eliminar Invoice, con iconos que representen esas operaciones.
- Para eliminar un Invoice, se habilitara un dialogo que confirme o rechace la operacion, ademas solo se podran eliminar Invoice en estado "PENDING".

