<div align="center">
<img src="./docs/images/icon.svg" alt="icon"/>

<h1 align="center">ChatGPT Next Web</h1>

One-Click to get well-designed cross-platform ChatGPT web UI.

一键免费部署你的跨平台私人 ChatGPT 应用。

[![Web][Web-image]][web-url]

[网页版](https://chatgpt.realduang.com/)

[web-url]: https://chatgpt.realduang.com
[Web-image]: https://img.shields.io/badge/Web-PWA-orange?logo=microsoftedge

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FrealDuang%2FChatGPT-Next-Web&env=AZURE_API_KEY&env=AZURE_ENDPOINT&env=AZURE_DEPLOY_NAME&env=CODE&project-name=chatgpt-next-web&repository-name=ChatGPT-Next-Web)

![cover](./docs/images/cover.png)

</div>

## 声明

项目 Fork 自 [ChatGPT-Next-Web](https://github.com/Yidadaa/ChatGPT-Next-Web)，在此基础上增加了 Azure OpenAI 部署支持，其余 feature 与该项目保持同步更新。

以下的文档仅补充 Azure OpenAI 相关用法，其余用法请参考原项目。

## 特性使用说明

### 效果图

![20230630142819](https://zakum-1252497671.cos.ap-guangzhou.myqcloud.com/20230630142819.png)

### 先决条件

- 拥有 Azure 订阅 - [免费创建订阅](https://azure.microsoft.com/zh-cn/free/cognitive-services/)
- 已在所需的 Azure 订阅中授予对 Azure OpenAI 的访问权限。可以通过在 [https://aka.ms/oai/access](https://aka.ms/oai/access) 中填写表单来申请对 Azure OpenAI 服务的访问权限。

- 已部署模型的 Azure OpenAI 资源。 有关模型部署的详细信息，请参阅[资源部署指南](https://learn.microsoft.com/zh-cn/azure/cognitive-services/openai/how-to/create-resource?pivots=web-portal)。

### 概念说明

若要成功地对 Azure OpenAI 发出调用，需要准备好以下各项：

| 变量名称        | 值                                                                                                                                                                                                                       |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| ENDPOINT        | 从 Azure 门户检查资源时，可在“密钥和终结点”部分中找到此值。 也可在“Azure OpenAI Studio”>“操场”>“代码视图”中找到该值。 示例终结点为：[https://docs-test-001.openai.azure.com/](https://docs-test-001.openai.azure.com/)。 |
| API-KEY         | 从 Azure 门户检查资源时，可在“密钥和终结点”部分中找到此值。 可以使用 KEY1 或 KEY2。                                                                                                                                      |
| DEPLOYMENT-NAME | 此值将对应于在部署模型时为部署选择的自定义名称。 此值可在 Azure 门户中的“资源管理”>“部署”下，或者在 Azure OpenAI Studio 中的“管理”>“部署”下找到此值。                                                                    |

### 环境变量

在 Vercel 部署时，需要参考以下环境变量进行设置：

#### `AZURE_API_KEY` （必填项）

API-KEY 密钥，从 Azure 门户检查资源时，可在“密钥和终结点”部分中找到此值。

#### `AZURE_ENDPOINT` （必填项）

ENDPOINT。从 Azure 门户检查资源时，可在“密钥和终结点”部分中找到此值。 也可在“Azure OpenAI Studio”>“操场”>“代码视图”中找到该值。

#### `AZURE_DEPLOY_NAME` （必填项）

DEPLOYMENT-NAME。 此值将对应于在部署模型时为部署选择的自定义名称。 此值可在 Azure 门户中的“资源管理”>“部署”下，或者在 Azure OpenAI Studio 中的“管理”>“部署”下找到此值。

#### `CODE` （可选）

访问密码，可选，可以使用逗号隔开多个密码。

**警告**：如果不填写此项，则任何人都可以直接使用你部署后的网站，可能会导致你的 token 被急速消耗完毕，建议填写此选项。

## Contributor

[Contributors](https://github.com/realDuang/ChatGPT-Next-Web/graphs/contributors)
