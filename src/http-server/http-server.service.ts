import { ForbiddenException, Injectable } from '@nestjs/common';
import { DataService, VersionConfig } from 'src/data/data.service';
import { starrail } from 'src/proto/starrail';

@Injectable()
export class HttpServerService {
    constructor(
        private dataService: DataService
    ) { }

    async getDispatchService() {
        const proto: starrail.GlobalDispatchData = new starrail.GlobalDispatchData({
            retcode: 0,
            serverList: [
                {
                    name: "KainSR",
                    title: "KainSR",
                    envType: "2",
                    dispatchUrl: "http://127.0.0.1:21000/query_gateway",
                },
            ],
        });
        const buffer = starrail.GlobalDispatchData.encode(proto).finish();
        return Buffer.from(buffer).toString("base64");
    }

    async getGatewayService(versions: string) {
        let dataVersion: VersionConfig = this.dataService.getVersionData()
        if (!dataVersion[versions]) {
            if (await this.dataService.autoUpdateVersion(versions)) {
                dataVersion = this.dataService.getVersionData()
            }
            else {
                throw new ForbiddenException(
                    'This version does not exist',
                );
            }
        }

        const proto: starrail.Gateserver = new starrail.Gateserver({
            retcode: 0,
            ip: "127.0.0.1",
            port: 23301,
            assetBundleUrl: dataVersion[versions].asset_bundle_url,
            exResourceUrl: dataVersion[versions].ex_resource_url,
            luaUrl: dataVersion[versions].lua_url,
            luaVersion: dataVersion[versions].lua_version,
            ifixVersion: dataVersion[versions].ifixUrl,
            HAFCIPEGPIN: true,
            FKENKKHLHHD: true,
            OPGMNLINAKC: true,
            MBDACJEJAMF: true,
            BGPCCKKDDMB: true,
            GJAEGHBEAIO: true,
            LAMJDOGMFAM: true,
            GEDIONGPDHA: true,
            MOIKMLHOIAP: true,
            KJADMKNDDJL: true, 
            // MJJBCCMCPLK: 'RWMyYhAAAAAhVmgc1cWvS2+HB3O6GRRrAAgAADHFRM1Yk175JGm53QP9LBFbp9ZpS5BmvqNwWwges6Ugjlgyr3wh5B7i4ohQqzkX/pr4qM4LgsMcOZ/t8ZowvEKLvtfBYx6udgv4SEAPZ2E9bFnLNIq3YCxjsYaViCr1wEiQAMdbw8q+1mKFMSHA0zs8pmd4SRoOG3jV3Ge9RJHSdy5zurEFErFNEyssqD0go9l9CQckyXCXwyGkLlUpVTJMZQuYf1SNTOD9B+r52x7qJq8fnmlEiL1Fc7Sfj8OYjdKzzZSEFGGRXpdauhSpleapjhRhcpTPrSu9ct9gssFILiKlTMOGZ2/Ux0rqzRA61S1NknvPEq0c4kxPCM3bGsI9mKqmyMhFqgYTbG06gezfovjlYjYJFhE1j7dGm9+pvmZ2el0lQeN/VidwRs3xQ5uN67w1Rgd+XjSLu7H30BL5SfFFZxGtd5deJyWrQTDYE+AzVaidk2kOVNkPwG/cutP4ns2OIyVjFkdFT1LnJ8vvCbl4XV7Sd854GseQP7H3YNvdRrIHiKErymFeSuwZRIU2Wcl5KEdl9d6qzr/qDVw8L6Ny9fP/KtEgu2YGJe3l2zhqqqLEX/AHMhjcqps1M0pPy+c24phWqGSv7/bgELO3D+I+vHx0BRrJVVNXNOGqjimg7f2PeYz8gRQqgQzAROO49B736hWB18GVZ2Ye2RhHdljgp2jRWIa3aHeBTYrmTHX99F4nUlAhVxCfZUyrpSN5bA5k0hLh5+ntQtJB7WJG0ATGmqJeivaEzVYGM/GFkKK04RS6fqLRxwPBbwBdk+jHBxYpOBtj6lj4v6XX7Fk5WoaSgaQraNJixLt+n061NdRjXAhDHDD9aHl59YPY93kQrweWH5bEfEx6rYouEuqXOnUAiPkmilYMYLo2nvHn5KBSfp7UN7PCWAv+ROfxlN1rLXGPA1BPKCWi6eHIcoTww3q42PZT0468xPVeNbPUDZIx5JZeavgXwQki0NJ1J/DBYlhelo+/4swooRldRc+xdM4hp/lMW3IDnWKS8zHyQ4gvfUnbQn+WunlVI3u7fufKS91HHpZ0ZoLTaKrSDqCf7Otj+gmYKChW7DOirNuzpLnn3VKf45+9tIZT8IfMQ5Y03OhbbpEYu29AsNX9M2ETPPI2cNyl4d7Snq91bMoMf9PXV8t296MuNUaZiEWDpQr2wnjyrf5sCtU38N7LS67IkLp3Li69MjyMeXzpDeXEvrfQDqu7A7Zst2O9f4lK812IdKZWpA7Lu91w6675qIroQIRllOWuLK+WIVMavCf1NyuJbhmuUjMsAk/+DEMaXoo4JBy/dO1iTXoHm57ppxfdznRY5nppgGjTAkhDkbYPUmJVXITmRtoKNoGMw/7WQago3lUyE0vBVPNDJJbH/Qy/ruijwVxknLF3m1pRdVHzZfhqgyKxivbOR3d/Vw8QXB2GkpdKW38dBTR7VpDhehTMaH8NJi7XTbyXlAjdrzjxsZZJMXq7qsf7dfi/q8jWHElfbIVXVQ3ZBZwyYvpTOOKvoY3gtwPDNjnJ/mdRyEjflL4H14YXo2aWVh4zZaqsTNsk8iuQiAQyQk3OIPezD0oGcKAOkUbi+zBF86gB0gVKDwKpTY7IGV7SlpxUGRgw4195uxfrypMJ7kiYBBhO+B1KO/VACXeZW0VU1ePNkSIXZqxCCd7Iq6hvlE+CcXzrKIdW7BhGq2dF1R1t5Y040We+6azLlWDRZoubJK2kCfhBkR04eUxPrjxJFxLtOb6HhrNIRVCgNxs6NBjajzwqIyFtGvoK39+gP6zoeczhS6pB61VNYZUjZZxGbGbz/k5yxUf6I374nxXNPlX3cNLFEjDv7QWJ6SZ97YkLbn4CKVI7q2zZdXVdLAnAW+ueGY6/9//T17BeT4cOt0Gr/ozKKLTEtVidYkLEikf0ShqTmfcIXrwweImVY8SC0+xQGteExrxCfYf/6RukeWJhZwU0Og/JsZiV7MiIQBYeevoXjoqxnBtFQUghY1o9KnHdF6dd2GvmWqXlUzSUjiExZHfdEOzdISWDjtIIMhBuaWoNFN/EJs+xonEsiB6Ykxg1qEe2RtQL0TJI02CjI3S0rHGb9RTumF6XU81FWJKxPqv6mS8EixzkiwMNuETfl9ys/qEtGXZNqB/Rp8gpkHeCclQptJs+xonEsiB6Ykxg1qEe2RtQL0TJI02CjI3S0rHGb9RTumF6XU81FWJKxPqv6mS8EixzkiwMNuETfl9ys/qEtGXZNqB/Rp8gpkHeCclQptJs+xonEsiB6Ykxg1qEe2RtQL0TJI02CjI3S0rHGb9RTumF6XU81FWJKxPqv6mS8EixzkiwMNuETfl9ys/qEtGXZNqB/Rp8gpkHeCclQptqsVddN5h4BO8yv1Xm7vqLBJFv3xZNErgdmJ8AcK1YcY7yv2D3d1oZWBmeRGe8W83zFzIHX5Vhi6o5NGhHyb+CpNGwuYh7vlDGdGjEXz1nbZ9Pnzx1D4Xvl15uiqzu7KSl0xsaa+Pgo0LhLm5M2koTvDPBo1/HN/8dyi705Mgfw2dQAf6qsYBscs+BXL3ftqJTnJh2bnUU/0MMg/UW/pXUf52WmfqoMnidQcHiLmd5yk01xgIF+xStpUVN8w0bc6DZm+u0/ysxkDBXv3voUzkw54q3u0uYNKnY0mMF+QTI/svir/1Fp1o+r4nicv5o2mbRhGp+v5LaUNSzNp0Lua+O1sMQH9I6UBlQ48cTurCRpfZuaGCSZD7qgdXc99TJkOLai5mJePIFQ5OOELMYQmSqDoANXE2Y0QxTQ1am3j8bARiuLEqJJnjsHLNf23LOD5HEpDpPoJmz9nFHN/VK4dtY7y4gAzLWfsYn5EKqmD1dFTrmKrcyhK//VSXT42o/VVszVN2RuTnzOVi7YcaN4DuA/1e39GOIP+zdon/XjqFWkfUxDqb7onj6au5mgm6y0UfBrb',
        });
        const buffer = starrail.Gateserver.encode(proto).finish();
        return Buffer.from(buffer).toString("base64");

    }
    async loginWithPassportService() {
        return {
            "data": {
                "id": "06611ed14c3131a676b19c0d34c0644b",
                "action": "ACTION_NONE",
                "geetest": null
            }, "message": "OK", "retcode": 0
        }
    }
    async loginWithAnyService() {
        return {
            "data": {
                "account": {
                    "area_code": "**",
                    "email": "KainSR",
                    "country": "VI",
                    "is_email_verify": "1",
                    "token": "mostsecuretokenever",
                    "uid": "1334"
                },
                "device_grant_required": false,
                "reactivate_required": false,
                "realperson_required": false,
                "safe_mobile_required": false
            },
            "message": "OK",
            "retcode": 0
        }
    }

    async riskyApiCheckService() {
        return {
            "data": {
                "id": "06611ed14c3131a676b19c0d34c0644b",
                "action": "ACTION_NONE",
                "geetest": null
            },
            "message": "OK",
            "retcode": 0
        }
    }

    async granterLoginVerificationService() {
        return {
            "data": {
                "account_type": 1,
                "combo_id": "1337",
                "combo_token": "9065ad8507d5a1991cb6fddacac5999b780bbd92",
                "data": "{\"guest\":false}",
                "heartbeat": false,
                "open_id": "1334"
            },
            "message": "OK",
            "retcode": 0
        }
    }

    async granterApiGetConfigService() {
        return {
            retcode: 0,
            message: "OK",
            data: {
                protocol: true,
                qr_enabled: false,
                log_level: "INFO",
                announce_url: "",
                push_alias_type: 0,
                disable_ysdk_guard: true,
                enable_announce_pic_popup: false,
                app_name: "崩 ??RPG",
                qr_enabled_apps: {
                    bbs: false,
                    cloud: false,
                },
                qr_app_icons: {
                    app: "",
                    bbs: "",
                    cloud: "",
                },
                qr_cloud_display_name: "",
                enable_user_center: true,
                functional_switch_configs: {},
            },
        }
    }

    async shieldApiLoadConfigService() {
        return {
            retcode: 0,
            message: "OK",
            data: {
                id: 24,
                game_key: "hkrpg_global",
                client: "PC",
                identity: "I_IDENTITY",
                guest: false,
                ignore_versions: "",
                scene: "S_NORMAL",
                name: "崩 ??RPG",
                disable_regist: false,
                enable_email_captcha: false,
                thirdparty: ["fb", "tw", "gl", "ap"],
                disable_mmt: false,
                server_guest: false,
                thirdparty_ignore: {},
                enable_ps_bind_account: false,
                thirdparty_login_configs: {
                    tw: {
                        token_type: "TK_GAME_TOKEN",
                        game_token_expires_in: 2592000,
                    },
                    ap: {
                        token_type: "TK_GAME_TOKEN",
                        game_token_expires_in: 604800,
                    },
                    fb: {
                        token_type: "TK_GAME_TOKEN",
                        game_token_expires_in: 2592000,
                    },
                    gl: {
                        token_type: "TK_GAME_TOKEN",
                        game_token_expires_in: 604800,
                    },
                },
                initialize_firebase: false,
                bbs_auth_login: false,
                bbs_auth_login_ignore: {},
                fetch_instance_id: false,
                enable_flash_login: false,
            },
        }
    }

    async shieldApiVerifyService(body: any) {
        let token = 'aa';
        let uid = '1334';

        if (body) {
            if (body.token) {
                token = body.token;
            }
            if (body.uid) {
                uid = body.uid;
            }
        }

        const response = {
            retcode: 0,
            message: 'OK',
            data: {
                account: {
                    email: 'KainSR',
                    token: token,
                    uid: uid,
                },
            },
        };

        return response;
    }

}
