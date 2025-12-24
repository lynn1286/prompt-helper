#!/bin/bash

# 发布脚本 - 自动更新版本并推送到 GitHub
# 用法: ./scripts/release.sh [patch|minor|major]

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 默认版本类型
VERSION_TYPE=${1:-patch}

# 验证版本类型
if [[ ! "$VERSION_TYPE" =~ ^(patch|minor|major)$ ]]; then
    echo -e "${RED}错误: 无效的版本类型 '$VERSION_TYPE'${NC}"
    echo "用法: ./scripts/release.sh [patch|minor|major]"
    echo "  patch - 补丁版本 (1.0.0 → 1.0.1)"
    echo "  minor - 次版本   (1.0.0 → 1.1.0)"
    echo "  major - 主版本   (1.0.0 → 2.0.0)"
    exit 1
fi

# 检查是否有未提交的更改
if [[ -n $(git status --porcelain) ]]; then
    echo -e "${RED}错误: 存在未提交的更改，请先提交或暂存${NC}"
    git status --short
    exit 1
fi

# 检查是否在 main/master 分支
CURRENT_BRANCH=$(git branch --show-current)
if [[ "$CURRENT_BRANCH" != "main" && "$CURRENT_BRANCH" != "master" ]]; then
    echo -e "${YELLOW}警告: 当前在 '$CURRENT_BRANCH' 分支，建议在 main/master 分支发布${NC}"
    read -p "是否继续? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# 获取当前版本
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo -e "${GREEN}当前版本: v$CURRENT_VERSION${NC}"

# 更新版本号
echo -e "${YELLOW}正在更新版本...${NC}"
npm version $VERSION_TYPE --no-git-tag-version > /dev/null

# 获取新版本
NEW_VERSION=$(node -p "require('./package.json').version")
echo -e "${GREEN}新版本: v$NEW_VERSION${NC}"

# 同步更新 README.md 中的版本徽章和版本号
echo -e "${YELLOW}正在同步更新 README.md...${NC}"
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/版本-[0-9]*\.[0-9]*\.[0-9]*/版本-$NEW_VERSION/g" README.md
    sed -i '' "s/当前版本：v[0-9]*\.[0-9]*\.[0-9]*/当前版本：v$NEW_VERSION/g" README.md
else
    # Linux
    sed -i "s/版本-[0-9]*\.[0-9]*\.[0-9]*/版本-$NEW_VERSION/g" README.md
    sed -i "s/当前版本：v[0-9]*\.[0-9]*\.[0-9]*/当前版本：v$NEW_VERSION/g" README.md
fi

# 同步更新 README-en.md 中的版本徽章和版本号
echo -e "${YELLOW}正在同步更新 README-en.md...${NC}"
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/version-[0-9]*\.[0-9]*\.[0-9]*/version-$NEW_VERSION/g" README-en.md
    sed -i '' "s/Current Version: v[0-9]*\.[0-9]*\.[0-9]*/Current Version: v$NEW_VERSION/g" README-en.md
else
    # Linux
    sed -i "s/version-[0-9]*\.[0-9]*\.[0-9]*/version-$NEW_VERSION/g" README-en.md
    sed -i "s/Current Version: v[0-9]*\.[0-9]*\.[0-9]*/Current Version: v$NEW_VERSION/g" README-en.md
fi

# 提交版本更新
git add package.json README.md README-en.md
git commit -m "chore(release):    🔨  v$NEW_VERSION"

# 创建 tag
git tag "v$NEW_VERSION"

# 推送到远程
echo -e "${YELLOW}正在推送到 GitHub...${NC}"
git push origin "$CURRENT_BRANCH"
git push origin "v$NEW_VERSION"

echo ""
echo -e "${GREEN}✅ 发布成功！${NC}"
echo -e "版本 v$NEW_VERSION 已推送到 GitHub"
echo -e "GitHub Actions 将自动构建并创建 Release"
echo -e "查看进度: https://github.com/lynn1286/prompt-helper/actions"
