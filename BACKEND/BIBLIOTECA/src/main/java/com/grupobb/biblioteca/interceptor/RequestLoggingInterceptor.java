package com.grupobb.biblioteca.interceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class RequestLoggingInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {

        // Marca de tiempo inicial
        request.setAttribute("t0", System.currentTimeMillis());

        // Log básico
        System.out.println("➡️ " + request.getMethod() + " " + request.getRequestURI());

        return true; // permite continuar con la ejecución normal
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex)
            throws Exception {

        Long t0 = (Long) request.getAttribute("t0");
        long elapsed = (t0 == null ? 0 : System.currentTimeMillis() - t0);

        // Añade el tiempo total como header
        response.addHeader("X-Elapsed-Time", elapsed + "ms");

        // Log de salida
        System.out.println("✔️ Completed -> HTTP " + response.getStatus()
                + " | Tiempo: " + elapsed + "ms");
    }
}
