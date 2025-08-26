import { http } from "@deepkit/http";

export class BaseController {
  @http.OPTIONS("")
  async options() {
    return "";
  }
}
