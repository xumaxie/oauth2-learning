package com.oauth2.auth.controller;

import org.springframework.security.oauth2.core.endpoint.OAuth2ParameterNames;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.security.Principal;
import java.util.*;

/**
 * 授权确认页面控制器
 *
 * 当用户登录后，Spring Authorization Server 会跳转到这个页面，
 * 让用户确认是否同意把权限授权给客户端应用。
 */
@Controller
public class ConsentController {

    private final RegisteredClientRepository registeredClientRepository;

    public ConsentController(RegisteredClientRepository registeredClientRepository) {
        this.registeredClientRepository = registeredClientRepository;
    }

    /** scope 中文名映射 */
    private static final Map<String, String> SCOPE_NAMES = Map.of(
        "openid", "基本信息（OpenID）",
        "read", "读取数据",
        "write", "写入数据",
        "profile", "个人资料",
        "email", "邮箱地址",
        "phone", "手机号码"
    );

    @GetMapping(value = "/oauth2/consent")
    public String consent(
            Principal principal,
            Model model,
            @RequestParam(OAuth2ParameterNames.CLIENT_ID) String clientId,
            @RequestParam(OAuth2ParameterNames.SCOPE) String scope,
            @RequestParam(OAuth2ParameterNames.STATE) String state) {

        RegisteredClient client = registeredClientRepository.findByClientId(clientId);
        String clientName = client != null ? client.getClientId() : clientId;

        // 解析所有请求的 scope
        Set<String> allScopes = new LinkedHashSet<>(Arrays.asList(scope.split(" ")));

        // 翻译 scope 名称
        List<Map<String, String>> scopes = new ArrayList<>();
        for (String s : allScopes) {
            scopes.add(Map.of(
                "name", s,
                "label", SCOPE_NAMES.getOrDefault(s, s)
            ));
        }

        model.addAttribute("clientId", clientName);
        model.addAttribute("clientName", getClientDisplayName(clientName));
        model.addAttribute("state", state);
        model.addAttribute("principalName", principal.getName());
        model.addAttribute("scopes", scopes);

        return "consent";
    }

    private String getClientDisplayName(String clientId) {
        return switch (clientId) {
            case "web-app" -> "Web 应用";
            case "server-app" -> "后端服务";
            default -> clientId;
        };
    }
}
