package com.oauth2.resource.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * 用户信息接口
 *
 * 这些接口受 OAuth2.0 保护，必须携带合法的 JWT token 才能访问。
 *
 * 【关键知识点】JWT token 里有什么？
 * - sub: 主体（通常是用户 ID 或客户端 ID）
 * - aud: 受众（token 是给谁用的）
 * - iss: 签发者（哪个授权服务器发的）
 * - exp: 过期时间
 * - iat: 签发时间
 * - scope: 权限范围（如 "read write"）
 * - 其他自定义声明
 */
@RestController
@RequestMapping("/api")
public class UserController {

    /**
     * 获取当前用户信息
     *
     * 从 JWT 中提取信息返回，展示 token 里到底装了什么。
     *
     * 测试方式：
     * curl -H "Authorization: Bearer <token>" http://localhost:8090/api/user/info
     */
    @GetMapping("/user/info")
    public Map<String, Object> userInfo(@AuthenticationPrincipal Jwt jwt) {
        return Map.of(
            "username", jwt.getClaimAsString("sub"),
            "scopes", jwt.getClaimAsString("scope"),
            "issuer", jwt.getClaimAsString("iss"),
            "issuedAt", jwt.getIssuedAt().toString(),
            "expiresAt", jwt.getExpiresAt().toString(),
            "tokenValue", jwt.getTokenValue().substring(0, 20) + "...",
            "allClaims", jwt.getClaims()
        );
    }

    /**
     * 需要读取权限的接口
     *
     * 要求 token 的 scope 包含 "read"。
     * 使用 @PreAuthorize 注解 + hasAuthority 检查 scope。
     *
     * 注意：OAuth2 的 scope 在 Spring Security 中会变成 "SCOPE_xxx" 形式的 authority。
     */
    @GetMapping("/user/profile")
    @PreAuthorize("hasAuthority('SCOPE_read')")
    public Map<String, Object> userProfile(@AuthenticationPrincipal Jwt jwt) {
        return Map.of(
            "message", "你有 read 权限，可以查看用户资料",
            "username", jwt.getClaimAsString("sub"),
            "profile", Map.of(
                "nickname", "张三",
                "email", "zhangsan@example.com",
                "avatar", "https://api.dicebear.com/7.x/avataaars/svg?seed=zhangsan"
            )
        );
    }

    /**
     * 公开接口 - 不需要 token
     */
    @GetMapping("/public/hello")
    public Map<String, Object> hello() {
        return Map.of(
            "message", "这是公开接口，不需要 token 就能访问",
            "timestamp", java.time.Instant.now().toString()
        );
    }
}
