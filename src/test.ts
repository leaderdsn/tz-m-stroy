getAllChildrenRecursive(id: TreeItemId): T[] {{
    const result: T[] = [];

    for (const child of this.getChildren(id)) {
      result.push(child);
      result.push(...this.getAllChildrenRecursive(child.id));
    }}

    return result;
}

getAllChildren(id: TreeItemId): T[] {
    const result = this.getChildren(id);

    for (const item of result) {
        const children = this.childrenByParentId.get(item.id);
        if (!children) {
            continue;
        }
        for (const child of children.values()) {
            result.push(child);
        }
    }

    return result;
}