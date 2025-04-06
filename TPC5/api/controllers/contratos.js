var Contrato = require('../models/contratos.js');

module.exports.getContratos = () => {
    return Contrato
        .find()
        .exec()
}

module.exports.getContratoById = id => {
    return Contrato
        .findById(id)
        .exec()
}

module.exports.getContratoByEntidade = entidade => {
    return Contrato
        .find( {'entidade_comunicante' : entidade} )
        .exec()
}

module.exports.getContratoByTipo = tipo => {
    return Contrato
        .find( {'tipodeprocedimento' : tipo} )
        .exec()
}

module.exports.getTipos = () => {
    return Contrato
            .distinct("tipoprocedimento")
            .sort()
            .exec();
}

module.exports.getEntidades = () => {
    return Contrato
            .find()
            .distinct("entidade_comunicante")
            .sort("entidade_comunicante")
            .exec();
}

module.exports.insert = contr => {
    let contrToSave = new Contrato(contr);
    return contrToSave.save();
}

module.exports.update = (contr, id) => {
    return Contrato
            .findByIdAndUpdate(id, contr, {new: true})  // O new devolve o objeto antes de ser atualizado
            .exec();
}

module.exports.delete = id => {
    return Contrato
            .findByIdAndDelete(id, {new: true})  // O new devolve o objeto antes de ser atualizado
            .exec();
}