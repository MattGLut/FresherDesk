import '@servicenow/sdk/global'

declare global {
    namespace Now {
        namespace Internal {
            interface Keys extends KeysRegistry {
                explicit: {
                    'api-key-acl-create': {
                        table: 'sys_security_acl'
                        id: '10aee3c61b95424f8d1785daea7bf08c'
                    }
                    'api-key-acl-delete': {
                        table: 'sys_security_acl'
                        id: '05ff331687a74373b1d28ae1dae83bba'
                    }
                    'api-key-acl-read': {
                        table: 'sys_security_acl'
                        id: '128459d09b6d40d79e1099078ca834fd'
                    }
                    'api-key-acl-write': {
                        table: 'sys_security_acl'
                        id: '12b5d6b9fb9042c1bfeaa4f53fb01b36'
                    }
                    bom_json: {
                        table: 'sys_module'
                        id: 'd9b1a37882d94a6393cfb147ea5ec410'
                    }
                    'comment-acl-create': {
                        table: 'sys_security_acl'
                        id: '8033a671306147edbd551aa772e9758f'
                    }
                    'comment-acl-delete': {
                        table: 'sys_security_acl'
                        id: 'ee2a4cd634a14ce9b04a805362921361'
                    }
                    'comment-acl-read': {
                        table: 'sys_security_acl'
                        id: 'a7c25cf57bf949a5ade28f02ad11b1f0'
                    }
                    'comment-acl-write': {
                        table: 'sys_security_acl'
                        id: '8f503f2ca6f7447a9739c01f33a1d880'
                    }
                    'create-ticket-from-email': {
                        table: 'sysevent_in_email_action'
                        id: '1cf00ba2d8f143f09d8342f8f0757c50'
                    }
                    package_json: {
                        table: 'sys_module'
                        id: '8f2f2e4ad49541e6bd9d9f17badf7ae8'
                    }
                    src_server_auth_validateApiKey_ts: {
                        table: 'sys_module'
                        id: 'a618b053ab7941d19b0dde2a723d3487'
                    }
                    src_server_email_createTicketFromEmail_ts: {
                        table: 'sys_module'
                        id: '7937cbe0d4bc475dadce82fba2f207d2'
                    }
                    src_server_rest_getTicket_ts: {
                        table: 'sys_module'
                        id: 'c3ff9e569c304c2c8e0ca32e9c68c1cd'
                    }
                    src_server_rest_listTickets_ts: {
                        table: 'sys_module'
                        id: '857cdf93b2bf4c6aa4b1765e8c42d2b3'
                    }
                    src_server_rest_updateTicket_ts: {
                        table: 'sys_module'
                        id: '988d3531662546caafc6fdf75f840dae'
                    }
                    src_server_tickets_commentTypes_ts: {
                        table: 'sys_module'
                        id: 'fc13814ac71a48a780de04b27082eca0'
                    }
                    src_server_tickets_recordTicketDeltaNotes_ts: {
                        table: 'sys_module'
                        id: '6a3a39d098ee475095a7613bcc1b5e1c'
                    }
                    src_server_tickets_ticketComments_ts: {
                        table: 'sys_module'
                        id: 'd3ef0209879142b2a1bd2eeb336bc078'
                    }
                    src_server_tickets_ticketLookup_ts: {
                        table: 'sys_module'
                        id: '10603e79bb1644e6aa5c4882231c26cc'
                    }
                    src_server_tickets_ticketQueries_ts: {
                        table: 'sys_module'
                        id: 'b362cb30eea34914b5d77fd334920d01'
                    }
                    src_server_tickets_ticketSerializer_ts: {
                        table: 'sys_module'
                        id: '89623efc90a14179818a4b0ab2748fa4'
                    }
                    src_server_tickets_ticketState_ts: {
                        table: 'sys_module'
                        id: 'd4ab7f6ee9f1426ca3672cf0a779565f'
                    }
                    src_server_tickets_ticketTags_ts: {
                        table: 'sys_module'
                        id: '52140668222944c2903b1c3376f373bb'
                    }
                    'ticket-acl-create': {
                        table: 'sys_security_acl'
                        id: '0ce074bb7c024c31beb7555f5571d56c'
                    }
                    'ticket-acl-delete': {
                        table: 'sys_security_acl'
                        id: '0d015d2000804b6b9bbecbbd7e7efaaf'
                    }
                    'ticket-acl-read': {
                        table: 'sys_security_acl'
                        id: '443d71e35ba9438d8d05fd4c7c8bc4b3'
                    }
                    'ticket-acl-write': {
                        table: 'sys_security_acl'
                        id: '528c24c7d9b548fd8a01874370d72843'
                    }
                    'ticket-delta-audit-br': {
                        table: 'sys_script'
                        id: '0d9dd3c5835d4209bd71892b4525cfa4'
                    }
                    'ticket-email-comment-br': {
                        table: 'sys_script'
                        id: '9ce096be130b40ec9d8f6511c7ef5a57'
                    }
                    'tickets-api-v1': {
                        table: 'sys_ws_version'
                        id: 'f1d94d564b0642d2bc17b7305374f2da'
                    }
                    'tickets-get-route': {
                        table: 'sys_ws_operation'
                        id: 'a67776959e1f4569a69172a030dbdf62'
                    }
                    'tickets-list-route': {
                        table: 'sys_ws_operation'
                        id: '3c702c4a1e63406588ddad4ed461a836'
                    }
                    'tickets-rest-api': {
                        table: 'sys_ws_definition'
                        id: '0b768bd506ac4f5a97411eb58074ee13'
                    }
                    'tickets-update-route': {
                        table: 'sys_ws_operation'
                        id: '783652ce81a143ed8bd98748fe7379f7'
                    }
                }
                composite: [
                    {
                        table: 'sn_glider_source_artifact'
                        id: '041d0a512c4e424ebd8a7f2335bd2c43'
                        key: {
                            name: 'x_2058901_fresher_ticket_workspace.do - BYOUI Files'
                        }
                    },
                    {
                        table: 'sys_db_object'
                        id: '093aebaf2b7b40849153a93700a0bcfa'
                        key: {
                            name: 'x_2058901_fresher_api_key'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '0b6ea21572084bbaaf4e285f79dd8c37'
                        key: {
                            name: 'x_2058901_fresher_ticket'
                            element: 'state'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '0de67b763b4b408f849ddf2c289a99f3'
                        key: {
                            name: 'x_2058901_fresher_ticket_comment'
                            element: 'comment_type'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '0fcf0753e22c4530b0170d51276760c1'
                        key: {
                            name: 'x_2058901_fresher_ticket'
                            element: 'category'
                            value: 'billing'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '10fe1234730c45b5a4629b63e9cbb64c'
                        key: {
                            name: 'x_2058901_fresher_ticket'
                            element: 'tags'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sn_glider_source_artifact_m2m'
                        id: '11cafc6d27644e2dad248906c5853eb6'
                        key: {
                            application_file: '5fdc7538a6224b3d977178184423f261'
                            source_artifact: '041d0a512c4e424ebd8a7f2335bd2c43'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '150aa88103e54c8c8bdfbc5a4da3ffa0'
                        key: {
                            name: 'x_2058901_fresher_api_key'
                            element: 'last_used'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '1591e732d4c04f7587c3294ab3887f50'
                        key: {
                            name: 'x_2058901_fresher_api_key'
                            element: 'name'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '163da06d3e154d328a0da4315f2a445f'
                        key: {
                            name: 'x_2058901_fresher_ticket'
                            element: 'category'
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: '17fe4047d4924120b8bce43179a496c2'
                        key: {
                            sys_security_acl: '128459d09b6d40d79e1099078ca834fd'
                            sys_user_role: {
                                id: 'd1efc529c53e41d08fd2fbe5399a7b81'
                                key: {
                                    name: 'x_2058901_fresher.admin'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '18b6d007c81a45e3919f743786146af3'
                        key: {
                            name: 'x_2058901_fresher_api_key'
                            element: 'active'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '19b5ef8af0c14ab2b87be5174a145ec7'
                        key: {
                            name: 'x_2058901_fresher_ticket_comment'
                            element: 'source'
                            value: 'email'
                        }
                    },
                    {
                        table: 'sn_glider_source_artifact_m2m'
                        id: '1c1c014388624b64957d7c48d26c1a64'
                        key: {
                            application_file: '5604814769e949fba410da4900a0bb00'
                            source_artifact: '041d0a512c4e424ebd8a7f2335bd2c43'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '1c968f6e9278430d901a197dc1e34714'
                        key: {
                            name: 'x_2058901_fresher_api_key'
                            element: 'NULL'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_ui_page'
                        id: '1d16f8f409584b0383cff0a1442944e4'
                        deleted: true
                        key: {
                            endpoint: 'x_2058901_fresher_incident_manager.do'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '20056329cc1040acacf90db7ed35faff'
                        key: {
                            name: 'x_2058901_fresher_ticket_comment'
                            element: 'source'
                            value: 'system'
                        }
                    },
                    {
                        table: 'ua_table_licensing_config'
                        id: '20bc194be3714156be11e61e9da3143d'
                        key: {
                            name: 'x_2058901_fresher_ticket'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '22e923959bd5494dab9cd18a8754f64e'
                        key: {
                            name: 'x_2058901_fresher_ticket_comment'
                            element: 'author'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '24af2c701604421fa36ad9f17be616e0'
                        key: {
                            name: 'x_2058901_fresher_ticket'
                            element: 'category'
                            value: 'general'
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: '2669a9071a004032bb8c4767da91d88d'
                        key: {
                            sys_security_acl: 'a7c25cf57bf949a5ade28f02ad11b1f0'
                            sys_user_role: {
                                id: 'f0cc966f036246d593acf246828b4955'
                                key: {
                                    name: 'x_2058901_fresher.agent'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '2b05dac2945f4c7f84992c4a7c5ac23d'
                        deleted: true
                        key: {
                            name: 'x_2058901_fresher_ticket_comment'
                            element: 'comment_type'
                            value: 'delta'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '2b3b6bc31953496cacb20f934a967df8'
                        key: {
                            name: 'x_2058901_fresher_ticket'
                            element: 'NULL'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_number'
                        id: '2be581c9cb774f7ab0ddb300abe36133'
                        key: {
                            category: 'x_2058901_fresher_ticket'
                            prefix: 'TKT'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '2d1dfaee29c84777ad7e9bc676afb4aa'
                        key: {
                            name: 'x_2058901_fresher_ticket_comment'
                            element: 'ticket'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sn_glider_source_artifact_m2m'
                        id: '30684d12de364c73a65040ea5a7642cd'
                        deleted: true
                        key: {
                            application_file: '5604814769e949fba410da4900a0bb00'
                            source_artifact: '7fd8d55779344f8d9a58e4e5683ff96b'
                        }
                    },
                    {
                        table: 'sys_user_role_contains'
                        id: '3a02d1d55e824f0cbf75feabcac9dd9c'
                        key: {
                            role: {
                                id: 'd1efc529c53e41d08fd2fbe5399a7b81'
                                key: {
                                    name: 'x_2058901_fresher.admin'
                                }
                            }
                            contains: {
                                id: 'f0cc966f036246d593acf246828b4955'
                                key: {
                                    name: 'x_2058901_fresher.agent'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: '3ac3c0fad3cd4963a17845ce20836da0'
                        key: {
                            sys_security_acl: '05ff331687a74373b1d28ae1dae83bba'
                            sys_user_role: {
                                id: 'd1efc529c53e41d08fd2fbe5399a7b81'
                                key: {
                                    name: 'x_2058901_fresher.admin'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: '3ca0e2925a144f97b85d0704df8c528c'
                        key: {
                            sys_security_acl: '528c24c7d9b548fd8a01874370d72843'
                            sys_user_role: {
                                id: 'f0cc966f036246d593acf246828b4955'
                                key: {
                                    name: 'x_2058901_fresher.agent'
                                }
                            }
                        }
                    },
                    {
                        table: 'ua_table_licensing_config'
                        id: '3dd8625750694a0ca94e008a6cd284a2'
                        key: {
                            name: 'x_2058901_fresher_ticket_comment'
                        }
                    },
                    {
                        table: 'sys_choice_set'
                        id: '3f4a81ff6b0b463381ebbd3336000834'
                        key: {
                            name: 'x_2058901_fresher_ticket'
                            element: 'category'
                        }
                    },
                    {
                        table: 'sys_dictionary_override'
                        id: '4094a3220e11436ab1d17e7b9f70914c'
                        deleted: true
                        key: {
                            name: 'x_2058901_fresher_ticket'
                            element: 'state'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '4b8358cf904f4d468f5d65be7bf24050'
                        key: {
                            name: 'x_2058901_fresher_ticket_comment'
                            element: 'source'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '4cb9a57ee93649b8815d32ba109fc7db'
                        key: {
                            name: 'x_2058901_fresher_ticket_comment'
                            element: 'body'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '529b84861eef4234a82d45315d0ef48f'
                        key: {
                            name: 'x_2058901_fresher_ticket_comment'
                            element: 'NULL'
                        }
                    },
                    {
                        table: 'sn_glider_source_artifact_m2m'
                        id: '53673b32437e4a57ac8372784dd3d4d6'
                        deleted: true
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
                        table: 'sys_choice'
                        id: '567b2782b51c493cbe69d1041bbce085'
                        key: {
                            name: 'x_2058901_fresher_ticket'
                            element: 'state'
                            value: '6'
                        }
                    },
                    {
                        table: 'sn_glider_source_artifact_m2m'
                        id: '5869d21072b749fdadeb188915e0a83d'
                        key: {
                            application_file: 'ac7603fcf22042c48beb66c076f2e5da'
                            source_artifact: '041d0a512c4e424ebd8a7f2335bd2c43'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '5d44666df14a488fb21a4257ace2b4c2'
                        key: {
                            name: 'x_2058901_fresher_ticket'
                            element: 'requester_email'
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
                        table: 'sys_security_acl_role'
                        id: '63c150bbe8274137a503232512ba7b12'
                        key: {
                            sys_security_acl: '0ce074bb7c024c31beb7555f5571d56c'
                            sys_user_role: {
                                id: 'f0cc966f036246d593acf246828b4955'
                                key: {
                                    name: 'x_2058901_fresher.agent'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '673a6754cd204351a25fcc10599d931a'
                        key: {
                            name: 'x_2058901_fresher_api_key'
                            element: 'key_hash'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '6bc3fee902754895b3d1703a14d0a96c'
                        key: {
                            name: 'x_2058901_fresher_ticket_comment'
                            element: 'body'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '6f702b028fef4055a5ca5bfa523cd540'
                        key: {
                            name: 'x_2058901_fresher_api_key'
                            element: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '751141e7d91844a9a3a1e5d50e6bc645'
                        key: {
                            name: 'x_2058901_fresher_api_key'
                            element: 'active'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: '757e8f6f41c14a3289fba4894de52a60'
                        key: {
                            sys_security_acl: '8033a671306147edbd551aa772e9758f'
                            sys_user_role: {
                                id: 'f0cc966f036246d593acf246828b4955'
                                key: {
                                    name: 'x_2058901_fresher.agent'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '7982bb9437934865a8b8b128a3f13717'
                        key: {
                            name: 'x_2058901_fresher_ticket'
                            element: 'state'
                            value: '1'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '7a304242399d4a44a22c715576981cbe'
                        key: {
                            name: 'x_2058901_fresher_ticket'
                            element: 'category'
                            value: 'technical'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '7b1416b44ad84838bf1d912cc402ab86'
                        key: {
                            name: 'x_2058901_fresher_ticket'
                            element: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '7d65562d300b4b3ba38a898e9cc5e70d'
                        key: {
                            name: 'x_2058901_fresher_ticket'
                            element: 'state'
                        }
                    },
                    {
                        table: 'sn_glider_source_artifact'
                        id: '7fd8d55779344f8d9a58e4e5683ff96b'
                        deleted: true
                        key: {
                            name: 'x_2058901_fresher_incident_manager.do - BYOUI Files'
                        }
                    },
                    {
                        table: 'sys_choice_set'
                        id: '8740869fce9b4ccf99a5c218df36fe6f'
                        key: {
                            name: 'x_2058901_fresher_ticket_comment'
                            element: 'source'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '90a5ef96469d4766807a319e9609c944'
                        key: {
                            name: 'x_2058901_fresher_ticket'
                            element: 'category'
                            value: 'account'
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: '90f68a781fc04a55bc1f8fe11bdd172b'
                        key: {
                            sys_security_acl: 'ee2a4cd634a14ce9b04a805362921361'
                            sys_user_role: {
                                id: 'f0cc966f036246d593acf246828b4955'
                                key: {
                                    name: 'x_2058901_fresher.agent'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '975a371cd885451c86eafa9e659f4edd'
                        key: {
                            name: 'x_2058901_fresher_ticket'
                            element: 'requester_email'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '980fefee38ea4e1fa0f61b353e3c989f'
                        key: {
                            name: 'x_2058901_fresher_ticket_comment'
                            element: 'author'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice_set'
                        id: '9c46cef47ebb459d82e7168ef73a2a93'
                        key: {
                            name: 'x_2058901_fresher_ticket'
                            element: 'state'
                        }
                    },
                    {
                        table: 'sys_db_object'
                        id: 'a6cf3daf00aa467c859dcc3caf80b7da'
                        key: {
                            name: 'x_2058901_fresher_ticket_comment'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'a6e340caed754e25bc28043d83ff6cf8'
                        key: {
                            name: 'x_2058901_fresher_api_key'
                            element: 'key_hash'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'a7054cac2480426b9dcb88a5067689de'
                        key: {
                            name: 'x_2058901_fresher_ticket_comment'
                            element: 'comment_type'
                            value: 'internal_note'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'a714fab1a9c441c3b148aed762cc0a1a'
                        key: {
                            name: 'x_2058901_fresher_ticket_comment'
                            element: 'comment_type'
                            value: 'public_reply'
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: 'a960b776a66744358eb5f7ea4148c5ce'
                        key: {
                            sys_security_acl: '10aee3c61b95424f8d1785daea7bf08c'
                            sys_user_role: {
                                id: 'd1efc529c53e41d08fd2fbe5399a7b81'
                                key: {
                                    name: 'x_2058901_fresher.admin'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_ui_page'
                        id: 'ac7603fcf22042c48beb66c076f2e5da'
                        key: {
                            endpoint: 'x_2058901_fresher_ticket_workspace.do'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'b3cdc637e4e44260b754fe0c56c2d3a6'
                        key: {
                            name: 'x_2058901_fresher_ticket_comment'
                            element: 'source'
                            value: 'agent'
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: 'b544d6ad15b846308309265c682a6c41'
                        key: {
                            sys_security_acl: '0d015d2000804b6b9bbecbbd7e7efaaf'
                            sys_user_role: {
                                id: 'f0cc966f036246d593acf246828b4955'
                                key: {
                                    name: 'x_2058901_fresher.agent'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: 'b6092f49acee4e9da9e8d55d9a994740'
                        key: {
                            sys_security_acl: '12b5d6b9fb9042c1bfeaa4f53fb01b36'
                            sys_user_role: {
                                id: 'd1efc529c53e41d08fd2fbe5399a7b81'
                                key: {
                                    name: 'x_2058901_fresher.admin'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: 'bb9b0d820a1f4d1b9a7ca43e095569fb'
                        key: {
                            sys_security_acl: '443d71e35ba9438d8d05fd4c7c8bc4b3'
                            sys_user_role: {
                                id: 'f0cc966f036246d593acf246828b4955'
                                key: {
                                    name: 'x_2058901_fresher.agent'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'bbcafc2031c5476cac6a7cad86897e08'
                        key: {
                            name: 'x_2058901_fresher_ticket'
                            element: 'source'
                            value: 'api'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'bce4c6829729454aacde0c50c82e50f0'
                        key: {
                            name: 'x_2058901_fresher_api_key'
                            element: 'last_used'
                        }
                    },
                    {
                        table: 'sn_glider_source_artifact_m2m'
                        id: 'bdb0000f6ee242659c81a4d7ac1ecd8f'
                        deleted: true
                        key: {
                            application_file: '1d16f8f409584b0383cff0a1442944e4'
                            source_artifact: '7fd8d55779344f8d9a58e4e5683ff96b'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'bdf65e887805424e8d8a74b10bee0eb5'
                        key: {
                            name: 'x_2058901_fresher_ticket'
                            element: 'source'
                            value: 'form'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'bfd49d68dc8e488c80250044cf0eea23'
                        key: {
                            name: 'x_2058901_fresher_ticket'
                            element: 'source'
                            language: 'en'
                        }
                    },
                    {
                        table: 'ua_table_licensing_config'
                        id: 'c078be83059349159318ca4d3c64533d'
                        key: {
                            name: 'x_2058901_fresher_api_key'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'c0f753ef51b0414ebd7da93fcde2dc11'
                        key: {
                            name: 'x_2058901_fresher_ticket_comment'
                            element: 'source'
                        }
                    },
                    {
                        table: 'sys_choice_set'
                        id: 'c4d7c9bdc9ca4d6693dbefdfd80e4246'
                        key: {
                            name: 'x_2058901_fresher_ticket_comment'
                            element: 'comment_type'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'c658dd5afb98464abe9465c2ab47975d'
                        key: {
                            name: 'x_2058901_fresher_ticket'
                            element: 'tags'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'cad72cf8a60f4a5189e5ec43ed70f355'
                        key: {
                            name: 'x_2058901_fresher_ticket'
                            element: 'state'
                            value: '2'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'cc94581bf1dd4097ab7f36a253b1a7b7'
                        key: {
                            name: 'x_2058901_fresher_ticket_comment'
                            element: 'comment_type'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'ce54d6ed41e2486099b23fe044dd3f3d'
                        key: {
                            name: 'x_2058901_fresher_ticket'
                            element: 'source'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'cf2231a847834b949a8731ddbb4e1293'
                        key: {
                            name: 'x_2058901_fresher_api_key'
                            element: 'name'
                        }
                    },
                    {
                        table: 'sys_user_role'
                        id: 'd1efc529c53e41d08fd2fbe5399a7b81'
                        key: {
                            name: 'x_2058901_fresher.admin'
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: 'd92781aef0ad4f98ab0786e1c6e1d0bb'
                        key: {
                            sys_security_acl: '8f503f2ca6f7447a9739c01f33a1d880'
                            sys_user_role: {
                                id: 'f0cc966f036246d593acf246828b4955'
                                key: {
                                    name: 'x_2058901_fresher.agent'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'd94f5a87da3c49c7891320faa7022f39'
                        key: {
                            name: 'x_2058901_fresher_ticket'
                            element: 'source'
                            value: 'email'
                        }
                    },
                    {
                        table: 'sys_choice_set'
                        id: 'd9649701bc8c414eb232f0d54470e60d'
                        key: {
                            name: 'x_2058901_fresher_ticket'
                            element: 'source'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'dca03ad553f945db9ed504d2a6e06a0e'
                        key: {
                            name: 'x_2058901_fresher_ticket'
                            element: 'category'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_db_object'
                        id: 'e0ea087293d34feb8cdfd4471c532e88'
                        key: {
                            name: 'x_2058901_fresher_ticket'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'e77510157a1043f697fd70721b67b45e'
                        key: {
                            name: 'x_2058901_fresher_ticket'
                            element: 'state'
                            value: '7'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'ee989f4d34b542afaf22a04177559834'
                        deleted: false
                        key: {
                            name: 'x_2058901_fresher_ticket_comment'
                            element: 'comment_type'
                            value: 'audit_delta'
                        }
                    },
                    {
                        table: 'sys_user_role'
                        id: 'f0cc966f036246d593acf246828b4955'
                        key: {
                            name: 'x_2058901_fresher.agent'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'f83895e6cfb04cc78cbad860c9c9cb9d'
                        key: {
                            name: 'x_2058901_fresher_ticket_comment'
                            element: 'NULL'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'fa881a904061484c9f34159bc758d44b'
                        key: {
                            name: 'x_2058901_fresher_ticket_comment'
                            element: 'ticket'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'fab84f2cbcb448e19267157c51a8e3d1'
                        key: {
                            name: 'x_2058901_fresher_ticket_comment'
                            element: 'source'
                            value: 'api'
                        }
                    },
                    {
                        table: 'sys_dictionary_override'
                        id: 'feec5a7396624c56b5ecf2840b47bda6'
                        key: {
                            name: 'x_2058901_fresher_ticket'
                            element: 'priority'
                        }
                    },
                ]
            }
        }
    }
}
