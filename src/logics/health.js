module.exports = class HealthLogic {
    constructor({logger}) {
        this.logger = logger
    }

    sample(){
        const {logger} = this
        logger.info(" Sample log")
    }
};
