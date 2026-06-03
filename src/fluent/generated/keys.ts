import '@servicenow/sdk/global'

declare global {
    namespace Now {
        namespace Internal {
            interface Keys extends KeysRegistry {
                explicit: {
                    bom_json: {
                        table: 'sys_module'
                        id: 'd9b1a37882d94a6393cfb147ea5ec410'
                    }
                    package_json: {
                        table: 'sys_module'
                        id: '8f2f2e4ad49541e6bd9d9f17badf7ae8'
                    }
                }
                composite: [
                    {
                        table: 'sys_ui_page'
                        id: '1d16f8f409584b0383cff0a1442944e4'
                        key: {
                            endpoint: 'x_2058901_fresher_incident_manager.do'
                        }
                    },
                    {
                        table: 'sn_glider_source_artifact_m2m'
                        id: '30684d12de364c73a65040ea5a7642cd'
                        key: {
                            application_file: '5604814769e949fba410da4900a0bb00'
                            source_artifact: '7fd8d55779344f8d9a58e4e5683ff96b'
                        }
                    },
                    {
                        table: 'sn_glider_source_artifact_m2m'
                        id: '53673b32437e4a57ac8372784dd3d4d6'
                        key: {
                            application_file: '5fdc7538a6224b3d977178184423f261'
                            source_artifact: '7fd8d55779344f8d9a58e4e5683ff96b'
                        }
                    },
                    {
                        table: 'sys_ux_lib_asset'
                        id: '5604814769e949fba410da4900a0bb00'
                        key: {
                            name: 'x_2058901_fresher/main.js.map'
                        }
                    },
                    {
                        table: 'sys_ux_lib_asset'
                        id: '5fdc7538a6224b3d977178184423f261'
                        key: {
                            name: 'x_2058901_fresher/main'
                        }
                    },
                    {
                        table: 'sn_glider_source_artifact'
                        id: '7fd8d55779344f8d9a58e4e5683ff96b'
                        key: {
                            name: 'x_2058901_fresher_incident_manager.do - BYOUI Files'
                        }
                    },
                    {
                        table: 'sn_glider_source_artifact_m2m'
                        id: 'bdb0000f6ee242659c81a4d7ac1ecd8f'
                        key: {
                            application_file: '1d16f8f409584b0383cff0a1442944e4'
                            source_artifact: '7fd8d55779344f8d9a58e4e5683ff96b'
                        }
                    },
                ]
            }
        }
    }
}
