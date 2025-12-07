import java.util.*;

interface Printable733 {
    String print();
}

class Report733 implements Printable733 {
    String title;
    String content;

    Report733(String title, String content) {
        this.title = title;
        this.content = content;
    }

    public String print() {
        return title + ":" + content;
    }
}

public class J733 {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String title = sc.next();
        String content = sc.next();
        Printable733 p = new Report733(title, content);
        System.out.print(p.print());
    }
}
