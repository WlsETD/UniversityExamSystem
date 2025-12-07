import java.util.*;

class Time708 {
    int hour;
    int minute;

    Time708(int hour, int minute) {
        this.hour = hour;
        this.minute = minute;
    }

    String format() {
        String h = (hour < 10 ? "0" : "") + hour;
        String m = (minute < 10 ? "0" : "") + minute;
        return h + ":" + m;
    }
}

public class J708 {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int h = sc.nextInt();
        int m = sc.nextInt();
        Time708 t = new Time708(h, m);
        System.out.print(t.format());
    }
}
