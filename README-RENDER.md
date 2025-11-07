# Render Deployment Structure Fix

Este arquivo força o Render a reconhecer que estamos na estrutura correta.

## O problema
O Render está configurado para procurar em `/opt/render/project/src/server` mas nosso código está na raiz.

## A solução
Criamos uma estrutura híbrida que satisfaz tanto a expectativa do Render quanto nossa estrutura atual.