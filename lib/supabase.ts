/**
 * --------------------------------------------------------
 * File: lib/supabase.ts
 * Purpose: Custom Supabase Client Wrapper.
 * Responsibilities: Intercepts client-side Supabase builder queries and maps them to a secure local server-side API `/api/supabase-mock` powered by Prisma and SQLite. Supports standard query chaining (.select(), .eq(), .insert(), etc.).
 * Author: Antigravity Maintainer
 * --------------------------------------------------------
 */

class SupabaseMockBuilder {
    private tableName: string;
    private filters: { field: string; value: any; op: string }[] = [];
    private orderField: string = "";
    private orderAsc: boolean = true;
    private limitVal: number | null = null;
    private isSingle: boolean = false;
    private action: "select" | "insert" | "update" | "delete" = "select";
    private valuesPayload: any = null;
    private selectOptions: any = null;

    constructor(tableName: string) {
        this.tableName = tableName;
    }

    select(fields: string = "*", options?: any) {
        this.selectOptions = options;
        return this;
    }

    eq(field: string, value: any) {
        this.filters.push({ field, value, op: "eq" });
        return this;
    }

    neq(field: string, value: any) {
        this.filters.push({ field, value, op: "neq" });
        return this;
    }

    gte(field: string, value: any) {
        this.filters.push({ field, value, op: "gte" });
        return this;
    }

    lte(field: string, value: any) {
        this.filters.push({ field, value, op: "lte" });
        return this;
    }

    order(field: string, options?: any) {
        this.orderField = field;
        this.orderAsc = options?.ascending !== false;
        return this;
    }

    limit(val: number) {
        this.limitVal = val;
        return this;
    }

    single() {
        this.isSingle = true;
        return this;
    }

    maybeSingle() {
        this.isSingle = true;
        return this;
    }

    insert(values: any) {
        this.action = "insert";
        this.valuesPayload = values;
        return this;
    }

    update(values: any) {
        this.action = "update";
        this.valuesPayload = values;
        return this;
    }

    delete() {
        this.action = "delete";
        return this;
    }

    /**
     * Executes the query on the server side via the supabase-mock API endpoint.
     * Returns a standard promise matching the Supabase JS return signature.
     */
    private async exec() {
        try {
            const res = await fetch("/api/supabase-mock", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    table: this.tableName,
                    action: this.action,
                    filters: this.filters,
                    orderField: this.orderField,
                    orderAsc: this.orderAsc,
                    limit: this.limitVal,
                    single: this.isSingle,
                    values: this.valuesPayload,
                    selectOptions: this.selectOptions,
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                return { data: null, error: { message: data.error || "Query failed" }, count: 0 };
            }
            return { data: data.data, error: null, count: data.count || 0 };
        } catch (e: any) {
            return { data: null, error: { message: e.message }, count: 0 };
        }
    }

    /**
     * Standard JSDoc Promise resolver. Makes this query builder awaited directly in Next.js pages.
     */
    then(onfulfilled?: (value: any) => any, onrejected?: (reason: any) => any): Promise<any> {
        return this.exec().then(onfulfilled, onrejected);
    }
}

export const supabase = {
    from(tableName: string) {
        return new SupabaseMockBuilder(tableName);
    },
    channel(name: string) {
        return {
            on(event: string, filter: any, callback: any) {
                return this;
            },
            subscribe(callback?: (...args: any[]) => any) {
                return this;
            }
        };
    },
    removeChannel(channel: any) {
        // Noop
    }
};

export default supabase;
