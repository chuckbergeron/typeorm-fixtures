"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
function createConnection(connectionName) {
    return __awaiter(this, void 0, void 0, function* () {
        const cor = new typeorm_1.ConnectionOptionsReader({
            root: process.cwd()
        });
        const options = yield cor.get('default');
        let connection = null;
        try {
            connection = yield typeorm_1.createConnection(options);
        }
        catch (err) {
            console.log(err);
        }
        return connection;
    });
}
exports.createConnection = createConnection;
//# sourceMappingURL=createConnection.js.map