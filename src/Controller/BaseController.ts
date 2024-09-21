
import { controller, httpGet } from "inversify-express-utils";
import BaseMiddleware from "../Middleware/BaseMiddleware";

@controller('/base')
abstract class BaseController extends BaseMiddleware{

    @httpGet('/')
    async baseMethod(){
        // this.logAndSendSimpleResponse()
    }
 }

export default BaseController;