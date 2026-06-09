package com.oauth2.resource.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;

/**
 * 订单接口
 *
 * 演示不同 scope 和 role 对 API 访问的控制。
 *
 * 【scope vs role 的区别】
 * - scope：OAuth2 的概念，表示"这个 token 被授权了哪些操作范围"
 *         由用户在授权页面同意，或者客户端注册时预设
 * - role：应用层面的概念，表示"这个用户在系统里的角色"
 *         由管理员分配
 *
 * 简单理解：scope 控制"token 能干什么"，role 控制"用户能干什么"
 */
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    // 模拟数据
    private final List<Map<String, Object>> orders = new ArrayList<>(List.of(
        Map.of("id", 1, "product", "MacBook Pro", "price", 14999, "status", "已发货"),
        Map.of("id", 2, "product", "iPhone 16", "price", 6999, "status", "待付款"),
        Map.of("id", 3, "product", "AirPods Pro", "price", 1799, "status", "已完成")
    ));

    /**
     * 查看订单列表 - 需要 read scope
     */
    @GetMapping
    @PreAuthorize("hasAuthority('SCOPE_read')")
    public Map<String, Object> listOrders(@AuthenticationPrincipal Jwt jwt) {
        return Map.of(
            "message", "你有 read 权限，可以查看订单",
            "user", jwt.getClaimAsString("sub"),
            "orders", orders,
            "total", orders.size()
        );
    }

    /**
     * 创建订单 - 需要 write scope
     */
    @PostMapping
    @PreAuthorize("hasAuthority('SCOPE_write')")
    public Map<String, Object> createOrder(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody Map<String, Object> orderRequest
    ) {
        Map<String, Object> newOrder = new HashMap<>();
        newOrder.put("id", orders.size() + 1);
        newOrder.put("product", orderRequest.getOrDefault("product", "未知商品"));
        newOrder.put("price", orderRequest.getOrDefault("price", 0));
        newOrder.put("status", "待付款");
        newOrder.put("createTime", Instant.now().toString());
        orders.add(newOrder);

        return Map.of(
            "message", "你有 write 权限，订单创建成功",
            "order", newOrder
        );
    }
}
